document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#exercise-input').value = "";
    document.querySelector('#search-form').onsubmit = search_exercise;
    document.querySelector('#add-exercise-container').style.display = 'none';
    document.querySelector('#search-container').style.display = 'block';
    document.querySelector('#prev-workout-container').style.display = 'block';
    document.querySelector('#add-exercise').addEventListener('click', () => add_exercise());
    document.querySelectorAll('button.prev-workout').forEach((button) => {
        button.addEventListener('click', () => load_exercise(button.id))
    });
});

function search_exercise() {
    document.querySelector('#prev-workout-container').style.display = 'none';
    var id = config.MY_API_ID;
    var key = config.MY_API_KEY;
    const input = document.querySelector('#exercise-input').value;
    fetch('https://trackapi.nutritionix.com/v2/natural/exercise', {
        "method": 'POST',
        "headers": {
            "x-app-id": id,
            "x-app-key": key,
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive"
        },
        body: JSON.stringify({

            "query": `${input}`

        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            data.exercises.forEach(exercise => {
                const main_button = document.createElement('button');
                main_button.className = "btn btn-info prev-workout";
                main_button.type = "button";

                const main_div = document.createElement('div');
                main_div.className = "row";

                const exercise_name = document.createElement('p');
                exercise_name.id ="name-view";
                exercise_name.innerHTML = exercise.name;

                const duration = document.createElement('p');
                duration.id = "duration-view";
                duration.innerHTML = `${exercise.duration_min.toFixed(2)} mins`;

                main_button.append(exercise_name);
                main_button.append(duration);

                main_div.append(main_button);

                main_button.addEventListener('click', () => get_workout(exercise.name, exercise.duration_min, exercise.nf_calories.toFixed(0)));

                const br = document.createElement('br');
                document.querySelector('#workout-col').append(br);
                document.querySelector('#workout-col').append(main_div);

                document.querySelector('#exercise-input').value = "";

            });
        })
        .catch(error => {
            console.log("Error: ", error);
        });

    return false;
}

function get_workout(name, duration, calories){
    document.querySelector('#search-container').style.display = 'none';
    document.querySelector('#add-exercise-container').style.display = 'block';

    document.querySelector('#exercise-name').innerHTML = name;
    document.querySelector('#duration').value = duration;
    document.querySelector('#calories').value = calories;
    document.querySelector('#duration').addEventListener('keydown', function() {
        document.querySelector('#save-exercise-edit').style.display = "block";
    });
    document.querySelector('#save-exercise-edit').addEventListener('click', () => edit_exercise(calories, duration));
}

function add_exercise(){ 
    const name = document.querySelector('#exercise-name').innerHTML;
    const calories_burnt = document.querySelector('#calories').value;
    const num_of_mins = document.querySelector('#duration').value;

    fetch(`/add-exercise`, {
        method: 'POST',
        body: JSON.stringify({
            name: name,
            calories_burnt: calories_burnt,
            num_of_mins: num_of_mins
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        document.querySelector('#add-exercise-container').style.display = 'none';
        document.querySelector('#workout-container').style.display = 'none';
        document.querySelector('#prev-workout-container').style.display = 'block';
        document.querySelector('#search-container').style.display = 'block';
    })
    return false;
}

function load_exercise(exercise_id){
    document.querySelector('#search-container').style.display = 'none';
    document.querySelector('#add-exercise-container').style.display = 'block';
    fetch(`/load-exercise/${parseInt(exercise_id)}`)
    .then(response => response.json())
    .then(workout => {
        console.log(workout);
        document.querySelector('#exercise-name').innerHTML = workout.name;
        document.querySelector('#duration').value = workout.num_of_mins;
        document.querySelector('#calories').value = workout.calories_burnt;
        document.querySelector('#duration').addEventListener('keydown', function() {
            document.querySelector('#save-exercise-edit').style.display = "block";
        });
        document.querySelector('#save-exercise-edit').addEventListener('click', () => edit_exercise(workout.calories_burnt, workout.num_of_mins))
    });
    return false;
}

function edit_exercise(calories, duration){
    const new_duration = parseFloat(document.querySelector('#duration').value);

    const new_calories = parseFloat(calories)/duration * new_duration

    document.querySelector('#calories').value = new_calories.toFixed(0);

}