from fastapi import FastAPI, HTTPException
from src.predictors.demand import predict_demand
app = FastAPI()

@app.post("/predict/demand")
def api_predict_demand(data: dict):
    try:
        return predict_demand(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))