from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import User, Expense, Category
from routers.auth import verify_password
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def get_current_user(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    return user

@router.post("/")
async def create_expense(
    amount: float = Form(...),
    description: str = Form(...),
    date: datetime = Form(...),
    category_id: int = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    
    # Verify category exists and belongs to user
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    expense = Expense(
        amount=amount,
        description=description,
        date=date,
        category_id=category_id,
        user_id=current_user.id
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/")
async def get_expenses(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    return expenses

@router.get("/{expense_id}")
async def get_expense(
    expense_id: int,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    return expense

@router.put("/{expense_id}")
async def update_expense(
    expense_id: int,
    amount: float = Form(...),
    description: str = Form(...),
    date: datetime = Form(...),
    category_id: int = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    # Verify category exists and belongs to user
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    expense.amount = amount
    expense.description = description
    expense.date = date
    expense.category_id = category_id
    
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(email, password, db)
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"} 