document.addEventListener('DOMContentLoaded', function() {
    //document.querySelector('#new-post-form').onsubmit = post_content;
    document.querySelectorAll('button.like-unlike').forEach((button) => {
        button.addEventListener('click', () => update_likes(button, button.id.slice(12, button.id.length)))
    });
    document.querySelectorAll('button.dislike-unlike').forEach((button) => {
        button.addEventListener('click', () => update_dislikes(button, button.id.slice(15, button.id.length)))
    });
});


// function post_content(){
//     const content = document.querySelector('#content').value;

//     fetch(`/posts`, {
//         method: 'POST',
//         body: JSON.stringify({
//             content: content
//         })
//     })
//     .then(response => response.json())
//     .then(result => {
//         console.log(result);
//     });
//     return false;
// }

function update_likes(button, post_id){
    fetch(`/update-likes/${post_id}`)
    .then(response => response.json())
    .then(result => {

        const heart_icon = document.createElement('i');
        heart_icon.className = "fa fa-thumbs-up";
        heart_icon.id = "heart-" + post_id; 
        heart_icon.style.color = "red";
        heart_icon.innerHTML = ` ${result.numOfLikes} likes`;

        const empty_heart_icon = document.createElement('i');
        empty_heart_icon.className = "fa fa-thumbs-o-up";
        empty_heart_icon.id = "empty-heart-" + post_id;
        empty_heart_icon.innerHTML = ` ${result.numOfLikes} likes`;

        if (result.liked === true) {
            document.querySelector('#empty-heart-' + post_id).remove();
            button.append(heart_icon);
        } else {
            document.querySelector('#heart-' + post_id).remove();
            button.append(empty_heart_icon);
        }
    })
    return false;
}

function update_dislikes(button, post_id){
    fetch(`/update-dislikes/${post_id}`)
    .then(response => response.json())
    .then(result => {

        const heart_icon = document.createElement('i');
        heart_icon.className = "fa fa-thumbs-down";
        heart_icon.id = "down-" + post_id; 
        heart_icon.style.color = "red";
        heart_icon.innerHTML = ` ${result.numOfDislikes} dislikes`;

        const empty_heart_icon = document.createElement('i');
        empty_heart_icon.className = "fa fa-thumbs-o-down";
        empty_heart_icon.id = "empty-down-" + post_id;
        empty_heart_icon.innerHTML = ` ${result.numOfDislikes} dislikes`;

        if (result.disliked === true) {
            document.querySelector('#empty-down-' + post_id).remove();
            button.append(heart_icon);
        } else {
            document.querySelector('#down-' + post_id).remove();
            button.append(empty_heart_icon);
        }
    })
    return false;
}