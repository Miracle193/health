from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
import datetime

# Create your models here.
class User(AbstractUser):
    class WeightUnit(models.TextChoices):
        POUND = 'lbs', _('Pound')
        KILOGRAM = 'kg', _('Kilogram')

    goal = models.DecimalField(max_digits=8, decimal_places=1, null=True)
    goal_unit = models.CharField(max_length=3, choices=WeightUnit.choices, default=WeightUnit.POUND, null=True)
    start_weight = models.DecimalField(max_digits=8, decimal_places=1, null=True)
    recent_weight = models.DecimalField(max_digits=8, decimal_places=1, null=True)
    daily_calories = models.IntegerField(null=True)
    weight_lost = models.DecimalField(max_digits=10, decimal_places=1, null=True)
    followers = models.ManyToManyField("self", related_name="following", blank=True, symmetrical=False)

    def get_weight_lost():
        return self.start_weight - self.recent_weight

    def current_weight(self, timestamp):
        weight = None
        try:
            weight = self.day.get(timestamp=timestamp).get_current_weight()
        except FitnessDiary.DoesNotExist:
            weight = self.recent_weight
        if weight is None:
            weight = self.recent_weight
        return float(weight)

    def get_day(self, timestamp):
        try:
            day = self.day.get(timestamp=timestamp)
            return {
                "weekday": timestamp.weekday(),
                "calories": day.day_calories(),
                "carbs": float(day.day_carbs()),
                "fat": float(day.day_fat()),
                "protein": float(day.day_protein()),
                "num_of_tasks_completed": day.tasks_completed(),
                "color": 0,
                "over-budget": (day.day_calories() - self.daily_calories) if self.daily_calories - day.day_calories() < 0 else 0,
                "over-color": 2 if self.daily_calories - day.day_calories() >= 0 else 1
            }
        except FitnessDiary.DoesNotExist:
            return {
                "weekday": timestamp.weekday(),
                "calories": 0,
                "carbs": 0.0,
                "fat": 0.0,
                "protein": 0.0,
                "num_of_tasks_completed": 0,
                "color": 1,
                "over-budget": 0,
                "over-color": 1
            }

    def get_day_diary(self, timestamp):
        try:
            day = self.day.get(timestamp=timestamp)
            return day
        except FitnessDiary.DoesNotExist:
            return None
    
    def get_prev_diaries(self, timestamp):
        prev_days = []
        for i in range(0, 7):
            prev_day = timestamp - datetime.timedelta(days=i)
            prev_days.append(self.get_day(timestamp=prev_day))
        prev_days.reverse()
        return prev_days

    def prev_goal_diaries(self, timestamp):
        prev_weights = []
        prev_days = []
        first_day = self.day.all().first().timestamp
        delta = timestamp - first_day

        for i in range(delta.days + 1):
            the_day = first_day + datetime.timedelta(days=i)
            prev_days.append(the_day.strftime("%F"))
            prev_weights.append(self.current_weight(timestamp=the_day))
        return prev_weights, prev_days

    def no_of_followers(self):
        return len(self.followers.all())

    def no_of_following(self):
        return len(self.following.all())
    
class Food(models.Model):
    name = models.CharField(max_length=64)
    brand_owner = models.CharField(max_length=64)
    calories = models.IntegerField()
    serving_size = models.DecimalField(max_digits=8, decimal_places=2)
    serving_unit =  models.CharField(max_length=64)
    total_fat = models.DecimalField(max_digits=8, decimal_places=1)
    cholesterol = models.DecimalField(max_digits=8, decimal_places=1)
    sodium = models.DecimalField(max_digits=8, decimal_places=1)
    total_carbs = models.DecimalField(max_digits=8, decimal_places=1)
    protein = models.DecimalField(max_digits=8, decimal_places=1)
    timestamp = models.DateField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "brand_owner": self.brand_owner,
            "calories": self.calories,
            "serving_size": self.serving_size,
            "serving_unit": self.serving_unit,
            "total_fat": self.total_fat,
            "cholesterol": self.cholesterol,
            "sodium": self.sodium,
            "total_carbs": self.total_carbs,
            "protein": self.protein
        }

class Exercise(models.Model):
    name = models.CharField(max_length=64)
    calories_burnt = models.IntegerField()
    num_of_mins = models.DecimalField(max_digits=8, decimal_places=2)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "calories_burnt": self.calories_burnt,
            "num_of_mins": self.num_of_mins
        }

class FitnessDiary(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="day")
    breakfast = models.ManyToManyField("Food", blank=True, related_name="breakfast")
    lunch = models.ManyToManyField("Food", blank=True, related_name="lunch")
    dinner = models.ManyToManyField("Food", blank=True, related_name="dinner")
    snacks = models.ManyToManyField("Food", blank=True, related_name="snacks")
    exercise = models.ManyToManyField("Exercise", blank=True, related_name="workouts")
    timestamp = models.DateField()
    current_weight = models.DecimalField(max_digits=8, decimal_places=1, blank=True, null=True)
    log_today = models.BooleanField(default=False)

    @classmethod
    def create_diary(cls, user, timestamp, current_weight):
        diary = cls(user=user, timestamp=timestamp, current_weight=current_weight)
        return diary

    def set_current_weight(self):
        self.current_weight = self.user.recent_weight

    def get_current_weight(self):
        return self.current_weight
        
    def breakfast_calories(self):
        if self.breakfast.all() is not None:
            return sum([calories.calories for calories in self.breakfast.all()])
        else:
            return 0

    def lunch_calories(self):
        if self.lunch.all() is not None:
            return sum([calories.calories for calories in self.lunch.all()])
        else:
            return 0

    def dinner_calories(self):
        if self.dinner.all() is not None:
            return sum([calories.calories for calories in self.dinner.all()])
        else:
            return 0
    
    def snacks_calories(self):
        if self.snacks.all() is not None:
            return sum([calories.calories for calories in self.snacks.all()])
        else:
            return 0

    def exercise_calories_burnt(self):
        if self.exercise.all() is not None:
            return sum([calories_burnt.calories_burnt for calories_burnt in self.exercise.all()])
        else:
            return 0

    def day_calories(self):
        return self.breakfast_calories() + self.lunch_calories() + self.dinner_calories() + self.snacks_calories() - self.exercise_calories_burnt()

    def day_carbs(self):
        return sum([carb.total_carbs for carb in self.breakfast.all() if carb]) + sum([carb.total_carbs for carb in self.lunch.all() if carb]) + sum([carb.total_carbs for carb in self.dinner.all() if carb]) + sum([carb.total_carbs for carb in self.snacks.all() if carb])

    def day_protein(self):
        return sum([prot.protein for prot in self.breakfast.all() if prot]) + sum([prot.protein for prot in self.lunch.all() if prot]) + sum([prot.protein for prot in self.dinner.all() if prot]) + sum([prot.protein for prot in self.snacks.all() if prot])

    def day_fat(self):
        return sum([fat.total_fat for fat in self.breakfast.all() if fat]) + sum([fat.total_fat for fat in self.lunch.all() if fat]) + sum([fat.total_fat for fat in self.dinner.all() if fat]) + sum([fat.total_fat for fat in self.snacks.all() if fat])

    def tasks_completed(self):
        count = 0
        if len(self.breakfast.all()) != 0:
            count = count + 1
        if len(self.lunch.all()) != 0:
            count = count + 1
        if len(self.dinner.all()) != 0:
            count = count + 1
        if self.current_weight is not None:
            count = count + 1
        return count

class Post(models.Model):
    creator = models.ForeignKey("User", on_delete=models.CASCADE, related_name="post_creator")
    content = models.CharField(max_length=2048)
    post_timestamp = models.DateTimeField(auto_now_add=True)
    like_users = models.ManyToManyField("User", related_name="liked_posts", blank=True)
    dislike_users = models.ManyToManyField("User", related_name="disliked_posts", blank=True)
        
    def likes(self):
        return len(self.like_users.all())

    def dislikes(self):
        return len(self.dislike_users.all())

    def serialize(self, logged_in_user=None):
        return {
            "id": self.id,
            "creator": self.creator,
            "content": self.content,
            "timestamp": self.post_timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "likes": self.likes(),
            "dislikes": self.dislikes(),
            "liked": logged_in_user in self.like_users.all() if logged_in_user else False,
            "disliked": logged_in_user in self.dislike_users.all() if logged_in_user else False
        }

    def __str__(self):
        return f'{self.creator} posted a tweet saying {self.content}.'