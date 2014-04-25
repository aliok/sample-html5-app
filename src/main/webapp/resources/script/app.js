/*
 * Copyright 2014 Ali Ok
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// not using a Javascript type, sorry, no time for that.
// C-like procedural approach


function SampleApp() {

}

// initialize app. register listeners, execute initial actions
SampleApp.prototype.initialize = function () {
    var self = this;
    self.registerAddActivityButtonListener();
    self.registerFlushButtonListener();
    self.registerActivityDeleteButtonListener();
    self.registerRefreshSummaryButtonListener();
    self.showSummary();
    self.showActivities();
};

// when add activity button is clicked:
// 1. do requiredness check for fields
// 2. generate a guid
// 3. save the activity with guid and provided inputs
// 4. then, refresh local activities table
SampleApp.prototype.registerAddActivityButtonListener = function () {
    var self = this;
    $('#addActivityButton').on('click', function () {

        var date = $('#dateInput').val();
        var description = $('#descriptionInput').val();

        if (!date) {                        // this means 'if date is empty'
            alert('Date cannot be empty!');
            return false;
        }

        if (!description) {                 // this means 'if description is empty'
            alert('Description cannot be empty!');
            return false;
        }

        var guid = self.guid();

        self.addNewActivity(date, description, guid);

        alert("Activity added");

        self.showActivities();
    });
};

SampleApp.prototype.addNewActivity = function (date, description, guid) {
    var self = this;

    // get all local activities array
    var activitiesArr = self.getActivities();

    // append the new activity to array
    activitiesArr.push({
        "id": guid,
        "date": date,
        "description": description
    });

    // save the activity array
    self.saveActivities(activitiesArr);

    // NOTE: ideally, we would use Web SQL for saving activities locally
    // currently we use local storage, which is basically a <String,String> store
    // thus,
    // --> we have to get 'all activities as string' from local storage
    // --> convert it to object,
    // --> add new activity
    // --> convert it to string, save it to local storage
};

SampleApp.prototype.registerFlushButtonListener = function () {
    var self = this;
    $('#flushButton').on('click', function () {
        self.flushActivities();
    });
};

// flush the activities to server and get the result and show it to user
SampleApp.prototype.flushActivities = function () {
    var self = this;

    // this is to be sent to server
    var dataToSend = {"activities": window.localStorage['activities']};

    $.post("flush", dataToSend, function (data) {
        // when success, this code block will be called

        alert('Successful : ' + data.success);

        // clear locally stored activities
        // ideally, we would receive ids of sent activities which are successful and which are not
        // then we would only remove the successful ones from local storage
        window.localStorage.removeItem('activities');

        // show activities again --> that means refresh
        self.showActivities();

        // show success message
        $('#flushSuccessMessage').show();
    })
        .fail(function () {
            alert("error");
        });

};

SampleApp.prototype.registerActivityDeleteButtonListener = function () {
    var self = this;

    // following listener registration also works for future elements that are matching the selector 'button.deleteActivityButton'
    // see api.jquery.com/live/
    $(document).on('click', 'button.deleteActivityButton', function () {
        var button = this;    // button that is clicked

        // button was generated with 'data-activity-id' attribute set to the row activity's id
        // thus we know which activity to delete
        var activityId = $(button).attr('data-activity-id');

        // delete activity by id
        self.deleteActivity(activityId);
    });
};

// search activity with given id in the local activities
// delete if found!
// later refresh the local activities table
SampleApp.prototype.deleteActivity = function (activityId) {
    var self = this;

    var activitiesArr = self.getActivities();

    // following block finds the index of activity to be deleted
    var indexOfActivityToBeDeleted = -1;
    for (var i = 0; i < activitiesArr.length; i++) {
        var activity = activitiesArr[i];
        if (activity.id == activityId) {
            indexOfActivityToBeDeleted = i;     // ha ha! found it
            break;
        }
    }

    // delete it from all activities array
    if (indexOfActivityToBeDeleted >= 0) {
        activitiesArr.splice(indexOfActivityToBeDeleted, 1);
    }

    // save all activities array again to storage
    self.saveActivities(activitiesArr);

    // refresh table
    self.showActivities();

    // NOTE: again, see the notes in SampleApp.prototype.addNewActivity about local storage usage
};

// delete local summary and then get the summary from the server
SampleApp.prototype.registerRefreshSummaryButtonListener = function () {
    var self = this;

    // ideally, it would be much better if we first get the new summary from server and then delete local one
    // implementation here needs improvement that way

    $('#refreshSummaryButton').on('click', function () {
        self.removeSummary();
        self.getSummary(function () {
        });
    });
};

SampleApp.prototype.showActivities = function () {
    // remove except first row. first line is the table header
    // rest of the rows are data rows
    $('#activitiesTable tr:not(tr:first)').remove();

    var self = this;

    // get activities array
    var activitiesArr = self.getActivities();

    // this is the activities table that we're gonna append rows into
    var activitiesTable = $('#activitiesTable');

    $.each(activitiesArr, function (index, activity) {
        // add a new row for each entry in activities array

        var line = "<tr>";

        // special Bootstrap classes to hide very long id column if the device is not wide enough
        // responsiveness...
        line += "<td class='hidden-sm hidden-xs'>" + activity.id + "</td>";
        line += "<td>" + activity.date + "</td>";
        line += "<td>" + activity.description + "</td>";

        // following is interesting
        // we set the activity's id to the button using a special attribute
        // later, when this button is clicked, it will learn what activity to delete with the value of that special attribute.
        // see SampleApp.prototype.registerActivityDeleteButtonListener
        line +=
            '<td><button type="button" class="deleteActivityButton btn btn-danger" data-activity-id="' +
                activity.id +
                '"><span class="glyphicon glyphicon-trash"></span> ' +
                'Delete</button></td>';

        line += "</tr>";

        // append the built line to the table
        activitiesTable.append(line);
    });
};

// same logic as SampleApp.prototype.showActivities, see the docs there
SampleApp.prototype.showSummary = function () {
    // remove except first line. first line is the table header
    $('#summaryTable tr:not(tr:first)').remove();

    var self = this;

    var activitiesArr = self.getSummary(function (data) {
        var summaryTable = $('#summaryTable');

        $.each(data.d.results, function (index, summary) {
            var line = "<tr>";

            line += "<td class='hidden-sm hidden-xs'>" + summary.date + "</td>";
            line += "<td>" + summary.activities + "</td>";
            line += "<td>" + summary.hours + "</td>";
            line += "</tr>";
            summaryTable.append(line);
        });
    });
};


// hacky implementation which converts objects to JSON string and saves it like that
SampleApp.prototype.getActivities = function () {
    if (!window.localStorage['activities'])
        window.localStorage['activities'] = '{"activitiesArr":[]}';

    var activitiesJSONStr = window.localStorage['activities'];

    var activitiesObj = jQuery.parseJSON(activitiesJSONStr);

    return activitiesObj['activitiesArr'];
};

// hacky implementation which converts objects to JSON string and saves it like that
SampleApp.prototype.saveActivities = function (activitiesArr) {
    var activitiesObj = {
        "activitiesArr": activitiesArr
    };

    window.localStorage['activities'] = JSON.stringify(activitiesObj);
};

// hacky implementation which converts objects to JSON string and saves it like that
SampleApp.prototype.getSummary = function (callback) {
    if (!window.localStorage['summary']) {
        $.post("summary.json", {}, function (data) {
            window.localStorage.removeItem('summary');
            window.localStorage['summary'] = data;
            callback(jQuery.parseJSON(data));
        })
            .fail(function () {
                alert("error fetching the summary");
            });
    }
    else {
        callback(jQuery.parseJSON(window.localStorage['summary']));
    }
};

SampleApp.prototype.removeSummary = function () {
    window.localStorage.removeItem('summary');
};

// taken from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
SampleApp.prototype.guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};