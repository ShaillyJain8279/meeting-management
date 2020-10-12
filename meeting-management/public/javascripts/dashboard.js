let meetings = [];
function readInput(){
    let input = document.getElementById('hiddenMeetingsList');
    let str = '[' + input.value + ']';
    meetings = JSON.parse(str)[0];
};
readInput();

// check if email is valid
function isValidEmail(inputText){
    let mailformat = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    return inputText.match(mailformat);
};

// displays the meeting details
function display(meetingId){
    let index = meetings.findIndex(meeting => meeting._id === meetingId);
    if (index === -1)   return;
    let meeting = meetings[index];
    $('#displayMeetingModal').modal('show');
    document.getElementById('displayMeetingId').innerText = meeting.meeting_id;
    let date = new Date(meeting.datetime);
    let timeString = (date.getDay() < 10 ? '0' : '') + date.getDay() + "/" 
                        +    (date.getMonth() < 10 ? '0' : '') + date.getMonth() + "/" + date.getFullYear() 
                        + " at " + (date.getHours() < 10 ? '0' : '') + date.getHours()
                        + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
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