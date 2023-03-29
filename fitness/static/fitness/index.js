
document.addEventListener('DOMContentLoaded', function() {

    //console.log(today_fat);
    document.querySelector('#calories').addEventListener('click', () => load_calories());
    document.querySelector('#macronutrients').addEventListener('click', () => load_macronutrients());

    load_calories();

});

function load_calories() {

        document.querySelector('#calorie-visual').style.display = "block";
        document.querySelector('#macronutrients-visual').style.display = "none";

        // $(function() {
        //     $('.chart').easyPieChart({
        //       size: 200,
        //       barColor: "#17d3e6",
        //       scaleLength: 0,
        //       lineWidth: 15,
        //       trackColor: "grey",
        //       lineCap: "circle",
        //       animate: 2000,
        //     });
        // });

        const normal_calories = 2000;
        var percentage = ((num_of_calories/normal_calories) * 100).toFixed(0);
        var under_budget = budget_calories - num_of_calories;
        //$('#progress-chart').attr('data-percent', percentage);
        
        // document.querySelector('#what_budget').style.color = "black";
        // document.querySelector('#what_budget').innerHTML = `${num_of_calories} net calories so far today`

        // if (under_budget <= budget_calories){
        //     $('.chart').attr('barColor', "#17d3e6");
        //     document.querySelector('#progress-chart').style.color = "#17d3e6";
        //     document.querySelector('#progress-chart').innerHTML = `${under_budget}`;
            
        // } else {
        //     $('.chart').attr('barColor', "red");
        //     document.querySelector('#progress-chart').style.color = "red";
        //     document.querySelector('#progress-chart').innerHTML = `${under_budget * -1}`;

        // }

        // Set the circle element of net percentage of calories taken
        const net_percent = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        net_percent.setAttribute("class", "donut-segment");
        net_percent.setAttribute("cx", 21);
        net_percent.setAttribute("cy", 21);
        net_percent.setAttribute("r", "9.549296586");
        net_percent.setAttribute("fill", "transparent");
        net_percent.setAttribute("stroke", "#17d3e6");
        net_percent.setAttribute("stroke-width", "3");
        net_percent.setAttribute("stroke-dashoffset", "-45");

        // Set g attribute
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "chart-text");

        const num_calories_text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        num_calories_text.setAttribute("x", "30%");
        num_calories_text.setAttribute("y", "30%");
        num_calories_text.setAttribute("class", "chart-number");

        const calories_text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        calories_text.setAttribute("x", "30%");
        calories_text.setAttribute("y", "30%");
        calories_text.innerHTML = "CALORIES";
        calories_text.setAttribute("class", "chart-label");

        const budget_text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        budget_text.setAttribute("x", "30%");
        budget_text.setAttribute("y", "30%");
        budget_text.setAttribute("class", "budget-label");

        if (under_budget >= 0){
            net_percent.setAttribute("stroke-dasharray", `${percentage} ${100 - percentage}`);
            document.querySelector('#cal-visual').append(net_percent);

            num_calories_text.setAttribute("fill", "#17d3e6");
            num_calories_text.innerHTML = `${under_budget}`;
            budget_text.innerHTML = "UNDER BUDGET";

            g.append(num_calories_text);
            g.append(calories_text);
            g.append(budget_text);

            document.querySelector('#cal-visual').append(g);

        } else {
            var over_percentage = (((under_budget * -1)/normal_calories) * 100).toFixed(0);
            var normal_percentage = ((budget_calories/normal_calories) * 100).toFixed(0);

            const over_percent = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            over_percent.setAttribute("class", "donut-segment");
            over_percent.setAttribute("cx", 21);
            over_percent.setAttribute("cy", 21);
            over_percent.setAttribute("r", "9.549296586");
            over_percent.setAttribute("fill", "transparent");
            over_percent.setAttribute("stroke", "red");
            over_percent.setAttribute("stroke-width", "3");

            console.log(over_percentage)
            console.log(normal_percentage)

            //over_percentage = 29
            net_percent.setAttribute("stroke-dasharray", `${normal_percentage} ${100 - normal_percentage}`);

            if ((under_budget * -1) + parseInt(budget_calories) >= normal_calories){
              const over = normal_calories - budget_calories;
              over_percentage = ((over/normal_calories) * 100).toFixed(0);
              over_percent.setAttribute("stroke-dasharray", `${over_percentage} ${100 - over_percentage}`);
              over_percent.setAttribute("stroke-dashoffset", `${100 - (100 - over_percentage) + -45}`);
            } else {
              net_percent.setAttribute("stroke-dashoffset", "-45");
              over_percent.setAttribute("stroke-dasharray", `${over_percentage} ${100 - over_percentage}`);
              over_percent.setAttribute("stroke-dashoffset", `${over_percentage - 1 + 177}`);
            }

            document.querySelector('#cal-visual').append(net_percent);
            document.querySelector('#cal-visual').append(over_percent);
            //document.querySelector('#cal-visual').append(net_percent);
            

            num_calories_text.style.color = "red";
            num_calories_text.innerHTML = `${under_budget * -1}`;
            budget_text.innerHTML = "OVER BUDGET";

            g.append(num_calories_text);
            g.append(calories_text);
            g.append(budget_text);

            document.querySelector('#cal-visual').append(g);

        }
        

        new Chart(document.getElementById("bar-chart"), {
            type: 'bar',
            data: {
              labels: [
                day_name[prev_days[0]], 
                day_name[prev_days[1]], 
                day_name[prev_days[2]], 
                day_name[prev_days[3]], 
                day_name[prev_days[4]], 
                day_name[prev_days[5]],
                day_name[prev_days[6]]
            ],
              datasets: [
                {
                  label: "Calories",
                  backgroundColor: "#17d3e6",
                  data: prev_calories
                }, 
                {
                  label: "Over Calories",
                  backgroundColor: "red",
                  data: over_budget
                }
              ]
            },
            options: {
              legend: { display: false },
              title: {
                display: true,
                text: `${num_of_calories} net calories so far of ${budget_calories} budget calories`
              },
              scales: {
                xAxes: [{
                  stacked: true
                }],
                yAxes: [{
                    display: true,
                    stacked: true,
                    ticks: {
                        display: false,
                        stacked: true,
                        min: 0,
                    }
                }]
              }
            }
            
        });
    
}

function load_macronutrients() {

        document.querySelector('#calorie-visual').style.display = "none";
        document.querySelector('#macronutrients-visual').style.display = "block";

        var total = today_fat + today_carbs + today_protein
        var fat_percent = ((today_fat/total) * 100).toFixed(0);
        var carb_percent = ((today_carbs/total) * 100).toFixed(0);
        var protein_percent = ((today_protein/total) * 100).toFixed(0);
        var backgroundColor = null;
        var datapoints = null;

        if (today_fat === 0 && today_carbs === 0 && today_protein === 0){
            backgroundColor = ["#d2d3d4"];
            datapoints = [100];
        } else {
            backgroundColor = ["yellow", "blue", "purple"];
            datapoints = [fat_percent, carb_percent, protein_percent];
        }

        new Chart(document.getElementById("doughnut-chart"), {
            type: 'doughnut',
            data: {
              datasets: [
                {
                  backgroundColor: backgroundColor,
                  data: datapoints,
                }
              ]
            },
            options: {
                tooltips: {enabled: false},
                hover: {mode: null},
            }
        });
        
        new Chart(document.getElementById("macro-bar-chart"), {
            type: 'bar',
            data: {
              labels: [
                day_name[prev_days[0]], 
                day_name[prev_days[1]], 
                day_name[prev_days[2]], 
                day_name[prev_days[3]], 
                day_name[prev_days[4]], 
                day_name[prev_days[5]],
                day_name[prev_days[6]]
            ],
              datasets: [
                {
                  label: `Fat ${today_fat}g/${fat_percent}%`,
                  backgroundColor: "yellow",
                  data: prev_fat
                },
                {
                    label: `Carb ${today_carbs}g/${carb_percent}%`,
                    backgroundColor: "blue",
                    data: prev_carbs
                }, 
                {
                    label: `Protein ${today_protein}g/${protein_percent}%`,
                    backgroundColor: "purple",
                    data: prev_protein
                }
              ]
            },
            options: {
              legend: { display: true },
              scales: {
                  xAxes: [{
                      stacked: true
                  }],
                yAxes: [{
                    display: true,
                    stacked: true,
                    ticks: {
                        display: false,
                    }
                }]
              }
            }
            
        });
    
}

// function load_cal (checkbox) {
//     if (checkbox.checked === true){
//         new Chart(document.getElementById("doughnut-chart"), {
//             type: 'doughnut',
//             data: {
//               labels: ["Africa", "Asia", "Europe", "Latin America", "North America"],
//               datasets: [
//                 {
//                   label: "Population (millions)",
//                   backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
//                   data: [2478,5267,734,784,433]
//                 }
//               ]
//             },
//             options: {
//               title: {
//                 display: true,
//                 text: 'Predicted world population (millions) in 2050'
//               }
//             }
//         });
        
//     }    
// }