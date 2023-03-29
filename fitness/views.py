import json
from django.forms import ModelForm
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from django.core.paginator import Paginator
import datetime
from decimal import Decimal

from .models import User, Food, Exercise, FitnessDiary, Post

class ProfileForm(ModelForm):
    class Meta:
        model = User
        fields = ['start_weight', 'goal', 'goal_unit', 'daily_calories']

def index(request):
    if request.user.is_authenticated:
        if request.user.start_weight is None:
            return HttpResponseRedirect(reverse("set profile"))
        breakfast = False
        lunch = False
        dinner = False
        weight = False
        diary = request.user.get_day_diary(timestamp=datetime.date.today())
        prev_diaries = request.user.get_prev_diaries(timestamp=datetime.date.today())
        userday = request.user.get_day(datetime.date.today())
        if  diary != None:
            breakfast = len(diary.breakfast.all()) > 0
            lunch = len(diary.lunch.all()) > 0
            dinner = len(diary.dinner.all()) > 0
            weight = diary.current_weight is not None
        return render(request, "fitness/index.html", {
            "num_of_tasks_completed": request.user.get_day(datetime.date.today())["num_of_tasks_completed"],
            "today_carbs": userday["carbs"],
            "today_fat": userday["fat"],
            "today_protein": userday["protein"],
            "breakfast_logged": breakfast,
            "lunch_logged": lunch,
            "dinner_logged": dinner,
            "weight_logged": weight,
            "num_of_calories": userday["calories"],
            "budget_calories": request.user.daily_calories,
            "prev_calories": [ x["calories"] for x in prev_diaries ],
            "prev_days": [ x["weekday"] for x in prev_diaries ],
            "prev_carbs": [ x["carbs"] for x in prev_diaries ],
            "prev_fat": [ x["fat"] for x in prev_diaries ],
            "prev_protein": [ x["protein"] for x in prev_diaries ],
            "prev_color": [ x["color"] for x in prev_diaries ],
            "over_color": [x["over-color"] for x in prev_diaries]
        })
    else:
        return HttpResponseRedirect(reverse("login"))

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "fitness/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "fitness/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "fitness/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "fitness/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("set profile"))
    else:
        return render(request, "fitness/register.html")

@login_required
def set_profile(request):
    if request.method == "POST":
        profile_form = ProfileForm(request.POST, instance=request.user)
        if profile_form.is_valid():
            profile_form.save()
            diary = FitnessDiary(user=request.user, timestamp=datetime.date.today(), current_weight=request.user.start_weight)
            diary.save()
            request.user.recent_weight = request.user.start_weight
            request.user.save()
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "fitness/goal.html", {
                "form": profile_form
            })
    else:
        return render(request, "fitness/goal.html", {
                "form": ProfileForm()
            })
    
@login_required
def log_food(request, log):
    diarys = FitnessDiary.objects.filter(user=request.user)
    food = []
    
    for diary in diarys:
        food += diary.breakfast.all()
        food += diary.lunch.all()
        food += diary.dinner.all()
        food += diary.snacks.all()
    print(food)
    return render(request, "fitness/search_food.html", {
        "log": log,
        "log_food": food
    })

@csrf_exempt
@login_required
def add_meal(request, meal):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    food = None
    diary = None
    
    name = data.get("name")
    brand_owner = data.get("brand_owner")
    calories = int(data.get("calories"))
    serving_size = float(data.get("serving_size"))
    serving_unit = data.get("serving_unit")
    total_fat = float(data.get("total_fat"))
    cholesterol = float(data.get("cholesterol"))
    sodium = float(data.get("sodium"))
    protein = float(data.get("protein"))
    total_carbs = float(data.get("total_carbs"))

    if Food.objects.all().filter(name=name, brand_owner=brand_owner, serving_size=serving_size).exists() is False:
        food = Food(
        name=name, 
        brand_owner=brand_owner, 
        calories=calories, 
        serving_size=serving_size,
        serving_unit=serving_unit,
        total_fat=total_fat,
        cholesterol=cholesterol,
        sodium=sodium,
        total_carbs=total_carbs,
        protein=protein
        )
        food.save()
    else:
        food = Food.objects.filter(name=name, brand_owner=brand_owner).first()

    if request.user.get_day_diary(timestamp = datetime.date.today()) is None:
        diary = FitnessDiary(user=request.user, timestamp=datetime.date.today(), current_weight=request.user.recent_weight)
        diary.save()
    else: 
        diary = request.user.get_day_diary(timestamp = datetime.date.today())

    if (meal == 'breakfast'):
        diary.breakfast.add(food)
    elif (meal == 'lunch'):
        diary.lunch.add(food)
    elif (meal == 'dinner'):
        diary.dinner.add(food)
    elif (meal == 'snacks'):
        diary.snacks.add(food)       
    diary.save()

    return JsonResponse({"message": "Meal added successfully."}, status=201)

@csrf_exempt
@login_required
def load_meal(request, meal_id):
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)

    try:
        food = Food.objects.get(id=meal_id)
    except Food.DoesNotExist:
        return JsonResponse({"error": "Meal not found."}, status=404)

    return JsonResponse(food.serialize())

@login_required
def load_diet(request):
    breakfast = None
    lunch = None
    dinner = None
    snacks = None
    exercise = None
    try:
        day = request.user.day.get(timestamp=datetime.date.today())
        breakfast = day.breakfast.all()
        lunch = day.lunch.all()
        dinner = day.dinner.all()
        snacks = day.snacks.all()
        exercise = day.exercise.all()
    except FitnessDiary.DoesNotExist:
        breakfast = []
        lunch = []
        dinner = []
        snacks = []
        exercise = []

    return render(request, "fitness/diet.html", {
        "breakfast": breakfast,
        "lunch": lunch,
        "dinner": dinner,
        "snacks": snacks,
        "exercise": exercise
    })

@csrf_exempt
@login_required
def delete_meal_exercise(request, meal_exercise_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)
    try:
        day = request.user.day.get(timestamp=datetime.date.today())
        if data["log"] == "breakfast":
            meal = day.breakfast.get(id=meal_exercise_id)
            day.breakfast.remove(meal)
        elif data["log"] == "lunch":
            meal = day.lunch.get(id=meal_exercise_id)
            day.lunch.remove(meal)
        elif data["log"] == "dinner":
            meal = day.dinner.get(id=meal_exercise_id)
            day.dinner.remove(meal)
        elif data["log"] == "snacks":
            meal = day.snacks.get(id=meal_exercise_id)
            day.snacks.remove(meal)
        elif data["log"] == "exercise":
            exercise = day.exercise.get(id=meal_exercise_id)
            day.exercise.remove(exercise)
        return HttpResponse(status=204)
    except FitnessDiary.DoesNotExist:
        return JsonResponse({"error": "Diary not found."}, status=404)

@login_required
def load_goal_data(request):
    if request.method == "POST":
        diary = None
        current_weight = request.POST["log-weight"]
        print(request.user.get_day_diary(timestamp=datetime.date.today()))
        if request.user.get_day_diary(timestamp=datetime.date.today()) is None:
            diary = FitnessDiary(user=request.user, timestamp=datetime.date.today())
            diary.save()
        else: 
            diary = request.user.get_day_diary(timestamp=datetime.date.today())
        diary.current_weight = Decimal(current_weight)
        diary.save()
        request.user.recent_weight = Decimal(current_weight)
        request.user.weight_lost = request.user.start_weight - Decimal(current_weight)
        request.user.save()

    prev_weights, prev_days = request.user.prev_goal_diaries(timestamp=datetime.date.today())
    return render(request, "fitness/goal-data.html", {
        "prev_weights": prev_weights,
        "prev_days": prev_days,
        "goal_unit": request.user.goal_unit
    })

@login_required
def log_exercise(request):
    diarys = FitnessDiary.objects.filter(user=request.user)
    exercise = []
    
    for diary in diarys:
        exercise += diary.exercise.all()
    print(exercise)
    return render(request, "fitness/search_exercise.html", {
        "log_exercise": exercise
    })

@csrf_exempt
@login_required
def add_exercise(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    exercise = None
    diary = None

    name = data["name"]
    calories_burnt = data["calories_burnt"]
    num_of_mins = data["num_of_mins"]

    if Exercise.objects.all().filter(name=name, num_of_mins=num_of_mins).exists() is False:
        exercise = Exercise(
        name=name, 
        calories_burnt=calories_burnt,
        num_of_mins=num_of_mins
        )
        exercise.save()
    else:
        exercise = Exercise.objects.filter(name=name, num_of_mins=num_of_mins).first()

    if request.user.get_day_diary(timestamp = datetime.date.today()) is None:
        diary = FitnessDiary(user=request.user, timestamp=datetime.date.today())
        diary.save()
    else: 
        diary = request.user.get_day_diary(timestamp = datetime.date.today())
    
    diary.exercise.add(exercise)
    return JsonResponse({"message": "Workout added successfully."}, status=201)

@csrf_exempt
@login_required
def load_exercise(request, exercise_id):
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)
    try:
        exercise = Exercise.objects.get(id=exercise_id)
    except Exercise.DoesNotExist:
        return JsonResponse({"error": "Exercise not found."}, status=404)

    return JsonResponse(exercise.serialize())
    
@csrf_exempt
@login_required
def load_community(request):
    new_post(request)

    posts = Post.objects.all()
    posts = posts.order_by("-post_timestamp").all()
    posts = [post.serialize(request.user) for post in posts]
    paginator = Paginator(posts, 10)

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "fitness/community.html", {
        'title': "All Posts",
        'posts': page_obj,
        'profile': None,
        'is_my_page': None,
        'is_following': None
    })

@login_required
def new_post(request):
    if request.method == "POST" and request.user.is_authenticated:

        creator = request.user
        print(request.POST)
        content = request.POST["contents"]
        
        post = Post(creator=creator, content=content)
        post.save()

@login_required
def profile_page(request, profile_username):
    profile = User.objects.get(username=profile_username)
    posts = Post.objects.filter(creator=profile)
    posts = posts.order_by("-post_timestamp").all()
    posts = [post.serialize(request.user) for post in posts]
    paginator = Paginator(posts, 10)

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "fitness/community.html", {
        'title': "Profile Page",
        'posts': page_obj,
        'profile': profile,
        'is_my_page': request.user == profile,
        'is_following': profile.followers.filter(pk=request.user.pk).exists() if request.user.is_authenticated else None
    })

@csrf_exempt
@login_required
def follow_unfollow(request, profile_username):
    if request.method == "POST" and request.user.is_authenticated:
        profile = User.objects.get(username=profile_username)
        if profile.followers.filter(pk=request.user.pk).exists():
            profile.followers.remove(request.user)
        else:
            profile.followers.add(request.user)
    return HttpResponseRedirect(reverse("profile_page", kwargs={'profile_username': profile_username}))

@csrf_exempt
@login_required
def like_unlike(request, post_id):
    post = Post.objects.get(pk=post_id)
    likedStatus = False
    if post.like_users.filter(pk=request.user.pk).exists():
        post.like_users.remove(request.user)

    else:
        post.like_users.add(request.user)
        likedStatus = True
    post.save()
    return JsonResponse({"liked": likedStatus, "numOfLikes": post.likes()}, status=200)

@csrf_exempt
@login_required
def dislike_unlike(request, post_id):
    post = Post.objects.get(pk=post_id)
    dislikedStatus = False
    if post.dislike_users.filter(pk=request.user.pk).exists():
        post.dislike_users.remove(request.user)

    else:
        post.dislike_users.add(request.user)
        dislikedStatus = True
    post.save()
    return JsonResponse({"disliked": dislikedStatus, "numOfDislikes": post.dislikes()}, status=200)
