import pandas as pd
from prophet import Prophet
from datetime import datetime
from pandas.tseries.offsets import MonthBegin
from dateutil.relativedelta import relativedelta

def predict_demand(payload: dict):
    try:
        inventory_id = payload.get("inventory_id")
        data = payload.get("data")
        months_to_predict = payload.get("months")

        df = pd.DataFrame(data)
        df["month"] = pd.to_datetime(df["month"])
        df = df.rename(columns={"month": "ds", "quantity": "y"})

        today = pd.to_datetime(datetime.today().strftime("%Y-%m-01"))
        last_date = df["ds"].max()

        if last_date < today:
            gap = pd.date_range(start=last_date + MonthBegin(), end=today - MonthBegin(), freq="MS")
            df = pd.concat([df, pd.DataFrame({"ds": gap, "y": [None] * len(gap)})], ignore_index=True)

        model = Prophet(interval_width=0.95)
        model.fit(df)

        future = model.make_future_dataframe(periods=months_to_predict, freq='MS')
        future = future[future["ds"] >= today]

        forecast = model.predict(future)

        forecast_result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].head(months_to_predict)
        
        result = []
        for horizon_index, (_, row) in enumerate(forecast_result.iterrows()):
            yhat = row["yhat"]
            lower = row["yhat_lower"]
            upper = row["yhat_upper"]

            interval_width = upper - lower
            relative_width = interval_width / (abs(yhat) + 1e-6)

            base_reliability = 1.0 - relative_width
            base_reliability = max(0.0, min(1.0, base_reliability))

            horizon_penalty = horizon_index * 0.07

            reliability = base_reliability - horizon_penalty
            reliability = max(0.0, min(1.0, reliability))

            reliability_pct = round(base_reliability * 100, 2)

            result.append({
                "month": row["ds"].strftime("%Y-%m"),
                "predictedQuantity": max(0, round(row["yhat"])),
                "reliability": reliability_pct
            })
        
        return {
            "inventoryId": inventory_id,
            "forecasts": result
        }
    
    except Exception as e:
        return {
            "error": str(e)
        }