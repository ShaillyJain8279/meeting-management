let meetings = [];
function readInput(){
    let input = document.getElementById('hiddenMeetingsList');
    let str = '[' + input.value + ']';
    meetings = JSON.parse(str)[0];
    setMeetings(meetings);
};
readInput();


// displays the set of meetings to user
function setMeetings(meetingList){
    let div = document.getElementById('meetingsListContainer');
    div.innerHTML = '';
    if (meetingList.length === 0) {
        div.innerHTML = '<h1>No meetings to show!</h1>';
        return;
    }
    let row = document.createElement('div');
    row.classList.add('row');
    row.setAttribute('style', "margin-top: 50px;");
    div.appendChild(row);
    row.innerHTML = '';
    for (let i = 0; i < meetingList.length; ++i){
        let meeting = meetingList[i];
        let csrfToken = document.getElementById('csrfToken').value;
        let timeString = new Date(meetings[i].datetime).toLocaleString();
        // let date = new Date(meetings[i].datetime);
        // let timeString = (date.getDay() < 10 ? '0' : '') + date.getDay() + "/" 
        //               + (date.getMonth() < 10 ? '0' : '') + date.getMonth() + "/" + date.getFullYear() 
        //               + " at " + (date.getHours() < 10 ? '0' : '') + date.getHours()
        //               + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
        row.innerHTML += 
        `
            <div class="col-md-6 col-lg-4">
            <div class="card" style="margin: 5px auto;">
            <div class="card-body">
                <h5 class="card-title height-20">${meeting.meeting_id}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${timeString}</h6>
                <p class="card-text height-50">${meeting.title}</p>
                <div class="card-button">
                <a href="#" class="card-link btn btn-info"
                    onclick="javascript:display('${meeting._id}')">
                    <i class="fas fa-info-circle"></i> View
                </a>
                <a href="#" class="card-link btn btn-success"
                    onclick="javascript:editMeeting('${meeting._id}')">
                    <form method="POST" action='/editMeetingForm' id='editMeetingForm_${meetings[i]._id}'>
                    <input type='hidden' name='editMeetingId' id='editMeetingId_${meetings[i]._id}'/>
                    <input type="hidden" name="_csrf" value="${csrfToken}" >                
                    </form>
                    <i class="fas fa-edit"></i> Edit
                </a>
                <a href="#" class="card-link btn btn-danger"
                    onclick="javascript:confirmDelete('${meeting._id}')">
                    <i class="fas fa-trash"></i> Delete
                </a>
                </div>
            </div>
            </div>
        </div>
        `;
    }
};


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


// displays the filter modal to user
function displayFilterModal(){
    $('#filtersModal').modal('show');
};
// add event listener to filter form
document.getElementById('filterForm').addEventListener('submit', event => {
    event.preventDefault();
    let filterMeetingId = document.getElementById('filterMeetingId').value;
    let filterTitle = document.getElementById('filterTitle').value;
    let filterOrganiserEmail = document.getElementById('filterOrganiserEmail').value;
    let filterAttendieEmail = document.getElementById('filterAttendieEmail').value;
    let filterDateAfter = document.getElementById('filterDateAfter').value;
    let filterDateBefore = document.getElementById('filterDateBefore').value;


    // if any filters are applied then toggle color to red!
    // stores the number of filters applied
    let count = 0;
    if (filterMeetingId && filterMeetingId.length > 0)               count++;
    if (filterTitle && filterTitle.length > 0)                       count++;
    if (filterOrganiserEmail && filterOrganiserEmail.length > 0)     count++;
    if (filterAttendieEmail && filterAttendieEmail.length > 0)       count++;
    if (filterDateAfter && filterDateAfter.length > 0)               count++;
    if (filterDateBefore && filterDateBefore.length > 0)             count++;
    let span = document.getElementById('filterBadge');
    span.innerText = count;
    span.setAttribute('style',  `display: ${count > 0 ? 'inline-block' : 'none'}`);

    let organiserEmails = parseEmails(filterOrganiserEmail);
    let attendieEmails = parseEmails(filterAttendieEmail);

    let filteredMeetings = meetings.filter(meeting => {
        let {meeting_id, title, organiser, attendies, datetime} = meeting;
        let consider = true;
        if (meeting_id.search(filterMeetingId) === -1)  consider = false;
        if (title.search(filterTitle) === -1)   consider = false;
        if (organiserEmails.length > 0 && organiserEmails.findIndex(mail => mail === organiser) === -1)  consider = false;

        let meetingAttendiesList = parseEmails(attendies);
        for (let i = 0; i < attendieEmails.length; ++i){
            if (meetingAttendiesList.findIndex(item => item === attendieEmails[i]) === -1){
                consider = false;
                break;
            }
        }

        let actualDate = new Date(datetime);
        if (filterDateAfter) {
            let afterDate = new Date(filterDateAfter);
            if (actualDate.getTime() < afterDate.getTime()) consider = false;
        }
        if (filterDateBefore) {
            let beforeDate = new Date(filterDateBefore);
            if (actualDate.getTime() > beforeDate.getTime())    consider = false;    
        }

        return consider;
    });
    setMeetings(filteredMeetings);
    $('#filtersModal').modal('hide');
});
// clears all the filters
function clearFilters(){
    document.getElementById('filterBadge').setAttribute('style', "display: none;");
    document.getElementById('filterMeetingId').value = '';
    document.getElementById('filterTitle').value = '';
    document.getElementById('filterOrganiserEmail').value = '';
    document.getElementById('filterAttendieEmail').value = '';
    document.getElementById('filterDateAfter').value = ''
    document.getElementById('filterDateBefore').value = '';
    setMeetings(meetings);
    $('#filtersModal').modal('hide');
};















// displays the meeting details
function display(meetingId){
    let index = meetings.findIndex(meeting => meeting._id === meetingId);
    if (index === -1)   return;
    let meeting = meetings[index];
    $('#displayMeetingModal').modal('show');
    document.getElementById('displayMeetingId').innerText = meeting.meeting_id;
    let timeString = new Date(meeting.datetime).toLocaleString();
    // let date = new Date(meeting.datetime);
    // let timeString = (date.getDay() < 10 ? '0' : '') + date.getDay() + "/" 
    //                     +    (date.getMonth() < 10 ? '0' : '') + date.getMonth() + "/" + date.getFullYear() 
    //                     + " at " + (date.getHours() < 10 ? '0' : '') + date.getHours()
    //                     + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    document.getElementById('displayMeetingDateTime').innerText = timeString;
    document.getElementById('displayMeetingTitle').innerText = meeting.title;
    document.getElementById('displayMeetingOrganiser').innerText = meeting.organiser;
    let attendiesContainer = document.getElementById('displayMeetingAttendies');
    attendiesContainer.innerHTML = '';
    let attendiesListString = meeting.attendies;
    let attendiesList = attendiesListString.split(',');
    for (let i = 0; i < attendiesList.length; ++i){
        let email = attendiesList[i].trim();
        if (email === '')   continue;
        if (!isValidEmail(email))    continue;
        attendiesContainer.innerHTML += `<div class='displayMeetingAttendieEmail'>${email}</div>`;
    }
};

// displays the delete confirmation
function confirmDelete(meetingId){
    $('#displayConfirmDeleteModal').modal('show');
    document.getElementById('deleteMeetingId').value = meetingId;
};
// cancel the delete operation
function cancelDelete(){
    $('#displayConfirmDeleteModal').modal('hide');
};
// procced the delete operation
function proceedDelete(){
    let form = document.getElementById('deleteMeetingForm');
    form.submit();
    $('#displayConfirmDeleteModal').modal('hide');
};
// procceds for editing a meeting
function editMeeting(meetingId){
    let form = document.getElementById(`editMeetingForm_${meetingId}`);
    let input = document.getElementById(`editMeetingId_${meetingId}`);
    input.value = meetingId;
    form.submit();
};



// adds the toggle password view functionality
function setTogglePassword() {
    $(".toggle-password").click(function() {
        $(this).toggleClass("zmdi-eye zmdi-eye-off");
        let id = $(this).attr('id');
        let input = document.getElementById(`${id}_input`);
        let type = (input.getAttribute('type') === 'password' ? 'text' : 'password');
        input.setAttribute('type', type);
    });
}
setTogglePassword();
// displays the update profile modal
function updateProfile(userString){
    let user = JSON.parse(userString);
    $('#updateProfileModal').modal('show');
    document.getElementById('profileName').value = user.username;
    document.getElementById('profileEmail').value = user.email;
};