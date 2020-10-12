// generates the list of emails for client
function populateAttendies(){
    let value = document.getElementById('attendiesList').value;
    let items = value.split(',');
    let attendiesListContainer = document.getElementById('attendiesListContainer');
    attendiesListContainer.innerHTML = '';
    for (let i = 0; i < items.length; ++i) {
        let email = items[i].trim( );
        if (email.length === 0) continue;
        let div = document.createElement('div');
        div.setAttribute('id', email);
        div.classList.add('attendieInput');
        div.innerHTML = `${email} <span onclick="javascript:removeAttendie('${email}')"><i class="fas fa-times"></i></span>`;
        attendiesListContainer.appendChild(div);
    }
};
populateAttendies();


// check if email is valid
function isValidEmail(inputText){
    let mailformat = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    return inputText.match(mailformat);
};

// removes an email from list
function removeAttendie(email) {
    let attendiesListContainer = document.getElementById('attendiesListContainer');
    let div = document.getElementById(email);
    attendiesListContainer.removeChild(div);
    let input = document.getElementById('attendiesList');
    let value = input.value.replace(email);
    let items = value.split(',');
    let newItems = [];
    for (let i = 0; i < items.length; ++i) {
        if (items[i] === email) continue;
        if (items[i] && items[i].length > 0) newItems.push(items[i].trim());
    }
    input.value = newItems.join(', ');
}

// remove an attendie from list
$('#attendies').on('keypress', event => {
    if (event.key === 'Enter') {
        event.preventDefault( );
        let value = event.target.value;
        if (isValidEmail(value)) {
            event.target.value = '';
            let input = document.getElementById('attendiesList');
            if (input.value.search(value) === -1){
                input.value = input.value + ', ' + value;
                populateAttendies();    
            }
        }
    }
});
