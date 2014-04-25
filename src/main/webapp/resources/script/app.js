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

SampleApp.prototype.initialize = function () {
    var self = this;
    self.registerAddActivityButtonListener();
    self.registerFlushButtonListener();
    self.registerActivityDeleteButtonListener();
    self.registerRefreshSummaryButtonListener();
    self.showSummary();
    self.showActivities();
};

SampleApp.prototype.registerAddActivityButtonListener = function () {
    var self = this;
    $('#addActivityButton').on('click', function () {

        var date = $('#dateInput').val();
        var description = $('#descriptionInput').val();

        if (!date) {
            alert('Date cannot be empty!');
            return false;
        }

        if (!description) {
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

    var activitiesArr = self.getActivities();

    activitiesArr.push({
        "id": guid,
        "date": date,
        "description": description
    });

    self.saveActivities(activitiesArr);
};

SampleApp.prototype.registerFlushButtonListener = function () {
    var self = this;
    $('#flushButton').on('click', function () {
        self.flushActivities();
    });
};

SampleApp.prototype.flushActivities = function () {
    var self = this;

    $.post("flush", {"activities": window.localStorage['activities']}, function (data) {
        alert('Successful : ' + data.success);
        window.localStorage.removeItem('activities');
        self.showActivities();
        $('#flushSuccessMessage').show();
    })
        .fail(function () {
            alert("error");
        });

};

SampleApp.prototype.registerActivityDeleteButtonListener = function () {
    var self = this;
    $(document).on('click', 'button.deleteActivityButton', function () {
        var button = this;    // button that is clicked
        var activityId = $(button).attr('data-activity-id');

        self.deleteActivity(activityId);
    });
};

SampleApp.prototype.deleteActivity = function (activityId) {
    var self = this;
    var activitiesArr = self.getActivities();
    var indexOfActivityToBeDeleted = -1;
    for (var i = 0; i < activitiesArr.length; i++) {
        var activity = activitiesArr[i];
        if (activity.id == activityId) {
            indexOfActivityToBeDeleted = i;
            break;
        }
    }

    if (indexOfActivityToBeDeleted >= 0) {
        activitiesArr.splice(indexOfActivityToBeDeleted, 1);
    }

    self.saveActivities(activitiesArr);

    self.showActivities();
};

SampleApp.prototype.registerRefreshSummaryButtonListener = function () {
    var self = this;
    $('#refreshSummaryButton').on('click', function () {
        self.removeSummary();
        self.getSummary(function () {
        });
    });
};

SampleApp.prototype.showActivities = function () {
    // remove except first line. first line is the table header
    $('#activitiesTable tr:not(tr:first)').remove();

    var self = this;

    var activitiesArr = self.getActivities();

    var activitiesTable = $('#activitiesTable');

    $.each(activitiesArr, function (index, activity) {
        var line = "<tr>";

        line += "<td class='hidden-sm hidden-xs'>" + activity.id + "</td>";
        line += "<td>" + activity.date + "</td>";
        line += "<td>" + activity.description + "</td>";
        line +=
            '<td><button type="button" class="deleteActivityButton btn btn-danger" data-activity-id="' +
                activity.id +
                '"><span class="glyphicon glyphicon-trash"></span>Delete</button></td>';

        line += "</tr>";
        activitiesTable.append(line);
    });
};

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

SampleApp.prototype.removeSummary = function (callback) {
    window.localStorage.removeItem('summary');
};

SampleApp.prototype.guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};