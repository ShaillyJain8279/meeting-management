// check if email is valid
function isValidEmail(inputText){
    let mailformat = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    return inputText.match(mailformat);
};

// parses the emails
function parseEmails(value){
    let items = value.split(',');
    let emails =[];
    for (let i = 0; i < items.length; ++i){
        let item = items[i].trim();
        if (!item)  continue;
        if (!isValidEmail(item))    continue;
        emails.push(item);
    }
    return emails;
}


// generates the list of emails for client
function populateAttendies(){
    let value = document.getElementById('attendiesList').value;
    let items = parseEmails(value);
    let attendiesListContainer = document.getElementById('attendiesListContainer');
    attendiesListContainer.innerHTML = '';
    for (let i = 0; i < items.length; ++i) {
        let email = items[i];
        if (email.length === 0) continue;
        if (!isValidEmail(email))   continue;
        let div = document.createElement('div');
        div.setAttribute('id', email);
        div.classList.add('attendieInput');
        div.innerHTML = `${email} <span onclick="javascript:removeAttendie('${email}')"><i class="fas fa-times"></i></span>`;
        attendiesListContainer.appendChild(div);
    }
};
populateAttendies();


// removes an email from list
function removeAttendie(email) {
    let attendiesListContainer = document.getElementById('attendiesListContainer');
    let div = document.getElementById(email);
    attendiesListContainer.removeChild(div);
    let input = document.getElementById('attendiesList');
    let items = parseEmails(input.value);
    let newItems = [];
    for (let i = 0; i < items.length; ++i) {
        if (items[i] === email) continue;
        if (items[i] && items[i].length > 0 && isValidEmail(items[i])) 
            newItems.push(items[i].trim());
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
                let oldValue = input.value;
                input.value = oldValue + (oldValue !== '' ? ', ' : '') + value;
                populateAttendies();    
            }
        }
    }
});
