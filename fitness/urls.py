from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("set-profile", views.set_profile, name="set profile"),
    path("log-food/<str:log>", views.log_food, name="log food"),
    path("add-meal/<str:meal>", views.add_meal, name="add meal"),
    path("load-meal/<int:meal_id>", views.load_meal, name="load meal"),
    path("diet", views.load_diet, name="diet"),
    path("delete-meal-exercise/<int:meal_exercise_id>", views.delete_meal_exercise, name="delete meal"),
    path("goal-data", views.load_goal_data, name="goal data"),
    path("log-exercise", views.log_exercise, name="log exercise"),
    path("add-exercise", views.add_exercise, name="add exercise"),
    path("load-exercise/<int:exercise_id>", views.load_exercise, name="load exercise"),
    path("load-community", views.load_community, name="load community"),
    path("posts", views.new_post, name="new_post"),
    path("profile-page/<str:profile_username>", views.profile_page, name="profile_page"),
    path("follow-unfollow/<str:profile_username>", views.follow_unfollow, name="follow_unfollow"),
    path("update-likes/<int:post_id>", views.like_unlike, name="update-likes"),
    path("update-dislikes/<int:post_id>", views.dislike_unlike, name="update-dislikes")
]