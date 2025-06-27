from fastapi import HTTPException


class TaskError(HTTPException):
    """Base exception for task-related errors"""
    pass


class TaskNotFoundError(TaskError):
    def __init__(self, task_id=None):
        message = "Task not found" if task_id is None else f"Task with id {task_id} not found"
        super().__init__(status_code=404, detail=message)


class TaskCreationError(TaskError):
    def __init__(self, error: str):
        super().__init__(status_code=500,
                         detail=f"Failed to create task: {error}")


class UserError(HTTPException):
    """Base exception for user-related errors"""
    pass


class UserNotFoundError(UserError):
    def __init__(self, user_id=None):
        message = "User not found" if user_id is None else f"User with id {user_id} not found"
        super().__init__(status_code=404, detail=message)


class AuthenticationError(HTTPException):
    def __init__(self, message: str = "Could not validate user"):
        super().__init__(status_code=401, detail=message)
