document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('button.delete-diet-button').forEach((button) => {
        button.addEventListener('click', () => delete_meal_exercise(button.id))
    });
})

function delete_meal_exercise(meal_exercise_id) {
    const arr = meal_exercise_id.split("-");
    const log = arr[0];
    const id = parseInt(arr[1]);
    fetch(`/delete-meal-exercise/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            log: log,
            meal_exercise_id: meal_exercise_id
        })
    })
    .then( () => {
        document.querySelector(`#li-${meal_exercise_id}`).remove();
    }).catch(error => {
        console.log("Error: ", error);
    });
    return false;
}