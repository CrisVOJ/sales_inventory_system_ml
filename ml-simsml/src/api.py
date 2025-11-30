from fastapi import FastAPI, HTTPException
from src.predictors.demand import predict_demand
from src.predictors.demand_rnn import predict_demand_rnn
app = FastAPI()

@app.post("/predict/demand")
def api_predict_demand(data: dict):
    try:
        return predict_demand(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/predict/demand_rnn")
def api_predict_demand_rnn(data: dict):
    try:
        return predict_demand_rnn(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))