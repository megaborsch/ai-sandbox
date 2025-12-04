from fastapi import APIRouter

from . import v1_endpoints

router = APIRouter()
router.include_router(v1_endpoints.router)
