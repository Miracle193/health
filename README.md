# About the Health App
The health app is a django app inspired from the Lose It! app (https://www.loseit.com/) where users can keep track of the amount of calories they take in a day to reach their weight loss goal. Users can simply set up their account, set their goal weight and keep track of their food and exercises daily. The app also provides various visualizations of a user's progress along with a community where users can interact and provide support to one another. See a preview of the app [here.](https://www.youtube.com/watch?v=LMpFRFXBWUg)

## Files Created
1. models.py: In this file, there are 5 models created:
a. User: This model keeps track of the user that is logged into the health app. This model contains fields such as the user goal weight, the goal unit, their start weight when they first created their account, their most recent weight, their fixed daily calories to be consumed, their weight lost and their followers.
b. Food: This is the model that keeps track of the contents of a meal such as its name, the number of calories, the serving size, the serving size unit, the brand owner and other nutrients such as protein, cholesterol, sodium, total fat etc
c. Exercise: This is the model that keeps track of the user's workouts. It's fields are the name of the workout, the duration and the number of calories burnt
d. FitnessDiary: This is the model that keeps track of the user's activity in a day i.e what they ate for breakfast, lunch, dinner, what exercise they did, and the day timestamp.
e. Post: This is the model that keeps tracks of users post in the community

2. layout.html: This is the html file that sets the layout for the app. If user is authenticated, they are able to access the Home, Diet, Exercise, Goal and Community pages along with the logout link.

3. login.html: This is the file that allows the user to login. The login_view function in views.py allows users to login.

4. register.html: This is the file that allows a user to create an account. The register function in views.py allows users to register.

5. goal.html: This is the file that prompts up a page when the user has created a an account. User must log in their current weight, their goal weight and their fixed daily calories. The set_profile function in views.py saves the users post.

6. index.html & index.js: These files handle the Home page in the project where users can see a visualization of the amounto of calories they have had so far on that day as long a bar chart visualizing their previous net calories in the past 7 days. Users can also view a visualization of the amount of nutrients they have consumed on that day (specifically the amount of protein, total fat and carbs) along with a bar chart visualization of the amount of nutrients in the past 7 days. On top of the home page is a tracker that tells users if they have logged in their breakfast, lunch, dinner and weight for the day. The function index in views.py provides the necessary contexts for these visualizations such as the get_prev_diaries(timestamp) function defined in the User model that gets the previous FitnessDiarys 7 days from the timestamp.

7. search_food.html & search_food.js: These files enables users to search for a particular food and returns a list of food that match the search. The search_food() and get_food(food_id) in search_food.js fetches resources from the FoodData Central Api (https://fdc.nal.usda.gov/api-guide.html)  and uses the demo key which is free (The hourly rate limit is 30 requests per IP address and the daily limit is 50 requests per IP address). The data fetched contains a list of food matching the query along with the brand owners, nutrients and calories. The functions log_food, add_meal and load_meal in views.py enable users to open the search food page, add a meal to their diet and load a meal's information respectively.

8. search_exercise.html & search_exercise.js: These files display the Exercise page. The files are very similar to the search_food.html & search_food.js functionalites. The major difference is that it fetches its resource from the Nutritionix Api (https://www.nutritionix.com/business/api). I used the free API key that Nutritionix gives to loggied in users (the daily limit is 50 requests per IP address). The functions log_exercise, add_exercise and load_exercise in views.py enable users to open the search exercise page, add a workout and load an exercise's information respectively.
### NB: In order to search for an exercise, please navigate to https://www.nutritionix.com/business/api, create an account and replace the headers, "x-app-id" and "x-app-key" in the search_exercise() methods with your Nutritionix api id and api key respectively (lines 21 & 22) in search_exercise.js. Nutritionix provides a free api key and id to users that create an account

9. goal-data.html & goal-data.js: These files displays the Goal page where users can log in their current weight for the day and also see a visualization of their weight progress so far since they created their account.

10. diet.html & diet.js: These files display the Diet page where users can see a list of the meal they had for breakfast, lunch, dinner as well as the snacks they had along with what workouts they did in that day. The load_diet and delete_meal_exercise functions in views.py enable users to load the Diet page and delete a meal or exercise logged for that day respectively.

11. community.html & community.js: These files display the community page where users can see all posts from all users in the app, they can follow other users, submit a post and like/dislike a post. The new_post, profile_page, like_unlike and dislike_unlike functiions in views.py enable users to publish a post, visit a profile page, like/unlike a post and dislike/undislike a post respectively.

