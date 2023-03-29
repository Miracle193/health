document.addEventListener('DOMContentLoaded', function() {
    load_chart();
})

function load_chart() {
    new Chart(document.getElementById("line-chart"), {
        type: 'line',
        data: {
          labels: prev_days,
          datasets: [{ 
              data: prev_weights,
              label: `Weight (in ${goal_unit})`,
              borderColor: "#17d3e6",
              fill: false
            }
          ]
        }
      });      
}