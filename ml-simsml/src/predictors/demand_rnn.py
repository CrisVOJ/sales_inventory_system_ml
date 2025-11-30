import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from datetime import datetime
from dateutil.relativedelta import relativedelta

def predict_demand_rnn(payload: dict):
    try:
        inventory_id = payload.get("inventory_id")
        data = payload.get("data")
        months_to_predict = payload.get("months")

        df = pd.DataFrame(data)
        df["month"] = pd.to_datetime(df["month"])
        df = df.sort_values("month")

        quantities = df["quantity"].values.reshape(-1, 1)

        scaler = MinMaxScaler()
        scaled = scaler.fit_transform(quantities)

        def create_sequences(data, window=3):
            X, y = [], []
            for i in range(len(data) - window):
                X.append(data[i:i + window])
                y.append(data[i + window])
            return np.array(X), np.array(y)

        window_size = 3
        X, y = create_sequences(scaled, window_size)

        if len(X) < 2:
            return {"error": "No hay suficientes datos para entrenar una RNN"}

        model = Sequential([
            LSTM(50, activation='tanh', input_shape=(X.shape[1], X.shape[2])),
            Dense(1)
        ])

        model.compile(optimizer='adam', loss='mse')
        model.fit(X, y, epochs=50, batch_size=4, verbose=0)

        today = datetime.today().replace(day=1)

        last_window = scaled[-window_size:].reshape(1, window_size, 1)

        predictions = []
        input_seq = last_window.reshape(1, window_size, 1)

        for i in range(months_to_predict):
            pred_scaled = model.predict(input_seq, verbose=0)
            pred_real = scaler.inverse_transform(pred_scaled)[0][0]

            predictions.append(max(0, round(pred_real)))

            next_input = np.append(input_seq[0][1:], pred_scaled[0])
            input_seq = next_input.reshape(1, window_size, 1)

        base_conf = 90
        forecasts = []

        for i, pred in enumerate(predictions):
            future_month = (today + relativedelta(months=i + 1)).strftime("%Y-%m")
            reliability = max(0, base_conf - (i * 10))

            forecasts.append({
                "month": future_month,
                "predictedQuantity": pred,
                "reliability": reliability
            })

        return {
            "inventoryId": inventory_id,
            "forecasts": forecasts
        }

    except Exception as e:
        return {"error": str(e)}
