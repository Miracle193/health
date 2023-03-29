document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#food-input').value = "";
    document.querySelector('#search-form').onsubmit = search_food;
    document.querySelector('#add-food-container').style.display = 'none';
    document.querySelector('#search-container').style.display = 'block';
    document.querySelector('#prev-food-container').style.display = 'block';
    document.querySelector('#add-meal').addEventListener('click', () => add_meal(meal));
    document.querySelectorAll('button.prev-food').forEach((button) => {
        button.addEventListener('click', () => load_meal(button.id))
    });
});

function search_food(){
    document.querySelector('#prev-food-container').style.display = 'none';
    const foody = document.querySelector('#food-input').value.replaceAll(" ", "%20");
    document.querySelector('#food-col').innerHTML = "";
    fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${foody}`, {
        "method": "GET",
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive"
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

        var foods = data.foods.filter(function(food) {
            return food.brandOwner != undefined;
        });

        foods.forEach(food => {
            const main_button = document.createElement('button');
            main_button.className = "btn btn-info prev-food";

            const main_div = document.createElement('div');
            main_div.className = "row";

            const food_name = document.createElement('p');
            food_name.id = "name-view";
            food_name.innerHTML = food.description;

            const brand_name = document.createElement('p');
            brand_name.id = "brand-calories-view";
            brand_name.innerHTML = food.brandOwner;

            main_button.append(food_name);
            main_button.append(brand_name);

            main_div.append(main_button);

            main_button.addEventListener('click', () => get_food(food.fdcId))

            const br = document.createElement('br');
            document.querySelector('#food-col').append(br);
            document.querySelector('#food-col').append(main_div);

            document.querySelector('#food-input').value = "";

        });
    })
    .catch(error => {
        console.log("Error: ", error);
    });
    //return false;
}

function get_food(food_id) {
    document.querySelector('#search-container').style.display = 'none';
    document.querySelector('#add-food-container').style.display = 'block';
    fetch(`https://api.nal.usda.gov/fdc/v1/food/${food_id}?api_key=DEMO_KEY`, {
        "method": "GET",
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive"
        }
    })
    .then(response => response.json())
    .then(food => {
        console.log(food); 
        document.querySelector('#food-name').innerHTML = food.description;
        document.querySelector('#food-brand').innerHTML = food.brandOwner;
        document.querySelector('#calories').value = food.labelNutrients.calories.value.toFixed(0);
        document.querySelector('#amount').value = food.servingSize.toFixed(2);
        document.querySelector('#servingunit').innerHTML = ` (in ${food.servingSizeUnit}):`
        document.querySelector('#total-fat').value = food.labelNutrients.fat.value.toFixed(1);
        document.querySelector('#cholesterol').value = food.labelNutrients.cholesterol.value.toFixed(1);
        document.querySelector('#sodium').value = food.labelNutrients.sodium.value.toFixed(1);
        document.querySelector('#total-carbs').value = food.labelNutrients.carbohydrates.value.toFixed(1);
        document.querySelector('#protein').value = food.labelNutrients.protein.value.toFixed(1);
        document.querySelector('#serving_unit').innerHTML = food.servingSizeUnit; 

        document.querySelector('#amount').addEventListener('keydown', function() {
            document.querySelector('#save-meal-edit').style.display = "block";
        });
        document.querySelector('#save-meal-edit').addEventListener('click', () => edit_meal(food.labelNutrients.calories.value.toFixed(0), food.servingSize.toFixed(2), food.labelNutrients.fat.value.toFixed(1), food.labelNutrients.cholesterol.value.toFixed(1), food.labelNutrients.sodium.value.toFixed(1), food.labelNutrients.carbohydrates.value.toFixed(1), food.labelNutrients.protein.value.toFixed(1)));

        // const amount = food.servingSize.toFixed(2);
        // const calories = food.labelNutrients.calories.value.toFixed(0);
        // const total_fat = food.labelNutrients.fat.value.toFixed(1);
        // const cholesterol = food.labelNutrients.cholesterol.value.toFixed(1);
        // const sodium = food.labelNutrients.sodium.value.toFixed(1);
        // const total_carbs = food.labelNutrients.carbohydrates.value.toFixed(1);
        // const protein = food.labelNutrients.protein.value.toFixed(1);

        // document.querySelector('#amount').addEventListener('keyup', calculate_nutrients(amount, calories, total_fat, cholesterol, sodium, total_carbs, protein));

    });
    return false;
}

function add_meal(meal){
    const name = document.querySelector('#food-name').innerHTML;
    const brand_owner = document.querySelector('#food-brand').innerHTML;
    const calories = document.querySelector('#calories').value;
    const serving_size = document.querySelector('#amount').value;
    const total_fat = document.querySelector('#total-fat').value;
    const cholesterol = document.querySelector('#cholesterol').value;
    const sodium = document.querySelector('#sodium').value;
    const total_carbs = document.querySelector('#total-carbs').value;
    const protein = document.querySelector('#protein').value;
    const serving_unit = document.querySelector('#serving_unit').innerHTML;

    fetch(`/add-meal/${meal}`, {
        method: 'POST',
        body: JSON.stringify({
            name: name,
            brand_owner: brand_owner,
            calories: calories,
            serving_size: serving_size,
            total_fat: total_fat,
            cholesterol: cholesterol,
            sodium: sodium,
            total_carbs: total_carbs,
            protein: protein,
            serving_unit: serving_unit
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        document.querySelector('#add-food-container').style.display = 'none';
        document.querySelector('#search-container').style.display = 'block';
    })
    return false;
}

// function calculate_nutrients(e, amount, calories, total_fat, cholesterol, sodium, total_carbs, protein) {

//     let new_amount = parseFloat(document.querySelector('#amount').value);
//     let multiple = new_amount/amount;
//     document.querySelector('#food-name').value = multiple;

//     document.querySelector('#calories').value = (multiple * calories).toFixed(0);
//     document.querySelector('#total-fat').value = (multiple * total_fat).toFixed(1);
//     document.querySelector('#cholesterol').value = (multiple * cholesterol).toFixed(1);
//     document.querySelector('#sodium').value = (multiple * sodium).toFixed(1);
//     document.querySelector('#total-carbs').value = (multiple * total_carbs).toFixed(1);
//     document.querySelector('#protein').value = (multiple * protein).toFixed(1);
// }

function load_meal(meal_id){
    document.querySelector('#search-container').style.display = 'none';
    document.querySelector('#add-food-container').style.display = 'block';
    fetch(`/load-meal/${parseInt(meal_id)}`)
    .then(response => response.json())
    .then(meal => {
        console.log(meal);
        document.querySelector('#food-name').innerHTML = meal.name;
        document.querySelector('#food-brand').innerHTML = meal.brand_owner;
        document.querySelector('#calories').value = meal.calories;
        document.querySelector('#amount').value = meal.serving_size;
        document.querySelector('#servingunit').innerHTML = ` (in ${meal.serving_unit}):`;
        document.querySelector('#total-fat').value = meal.total_fat;
        document.querySelector('#cholesterol').value = meal.cholesterol;
        document.querySelector('#sodium').value = meal.sodium;
        document.querySelector('#total-carbs').value = meal.total_carbs;
        document.querySelector('#protein').value = meal.protein;
        document.querySelector('#serving_unit').innerHTML = meal.serving_unit;

        document.querySelector('#amount').addEventListener('keydown', function() {
            document.querySelector('#save-meal-edit').style.display = "block";
        });
        document.querySelector('#save-meal-edit').addEventListener('click', () => edit_meal(meal.calories, meal.serving_size, meal.total_fat, meal.cholesterol, meal.sodium, meal.total_carbs, meal.protein));
    });
    return false;
}

function edit_meal(calories, amount, total_fat, cholesterol, sodium, total_carbs, protein){
    let new_amount = parseFloat(document.querySelector('#amount').value);
    let multiple = new_amount/amount;
    document.querySelector('#food-name').value = multiple;

    document.querySelector('#calories').value = (multiple * calories).toFixed(0);
    document.querySelector('#total-fat').value = (multiple * total_fat).toFixed(1);
    document.querySelector('#cholesterol').value = (multiple * cholesterol).toFixed(1);
    document.querySelector('#sodium').value = (multiple * sodium).toFixed(1);
    document.querySelector('#total-carbs').value = (multiple * total_carbs).toFixed(1);
    document.querySelector('#protein').value = (multiple * protein).toFixed(1);
}