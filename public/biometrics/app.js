var test = null;
var myVal = "";
var disabled = true;
var startEnroll = false;

var currentFormat = Fingerprint.SampleFormat.PngImage;
var deviceTechn = {
    0: "Unknown",
    1: "Optical",
    2: "Capacitive",
    3: "Thermal",
    4: "Pressure"
}

var deviceModality = {
    0: "Unknown",
    1: "Swipe",
    2: "Area",
    3: "AreaMultifinger"
}

var deviceUidType = {
    0: "Persistent",
    1: "Volatile"
}

var FingerprintSdkTest = (function () {

    function FingerprintSdkTest() {
        var _instance = this;
        this.operationToRestart = null;
        this.acquisitionStarted = false;
        this.sdk = new Fingerprint.WebApi;
        this.sdk.onDeviceConnected = function (e) {
            // Detects if the device is connected for which acquisition started
            showMessage("Scan your finger now.");
        };
        this.sdk.onDeviceDisconnected = function (e) {
            // Detects if device gets disconnected - provides deviceUid of disconnected device
            showMessage("Device disconnected");
        };
        this.sdk.onCommunicationFailed = function (e) {
            // Detects if there is a failure in communicating with U.R.U web SDK
            showMessage("Communication Failed")
        };
        this.sdk.onSamplesAcquired = function (s) {
            // Sample acquired event triggers this function
            sampleAcquired(s);
        };
        this.sdk.onQualityReported = function (e) {
            // Quality of sample aquired - Function triggered on every sample acquired
            document.getElementById("qualityInputBox").value = Fingerprint.QualityCode[(e.quality)];
        }
    }
    FingerprintSdkTest.prototype.startCapture = function () {
        if (this.acquisitionStarted) // Monitoring if already started capturing
            return;
        var _instance = this;
        showMessage("");
        this.operationToRestart = this.startCapture;
        this.sdk.startAcquisition(currentFormat, myVal).then(function () {
            _instance.acquisitionStarted = true;
            //Disabling start once started
        }, function (error) {
            showMessage(error.message);
        });
    };
    FingerprintSdkTest.prototype.stopCapture = function () {
        if (!this.acquisitionStarted) //Monitor if already stopped capturing
            return;
        var _instance = this;
        showMessage("");
        this.sdk.stopAcquisition().then(function () {
            _instance.acquisitionStarted = false;
            //Disabling stop once stoped
        }, function (error) {
            showMessage(error.message);
        });
    };

    FingerprintSdkTest.prototype.getInfo = function () {
        var _instance = this;
        return this.sdk.enumerateDevices();
    };

    FingerprintSdkTest.prototype.getDeviceInfoWithID = function (uid) {
        var _instance = this;
        return this.sdk.getDeviceInfo(uid);
    };


    return FingerprintSdkTest;
})();

function showMessage(message) {
    var _instance = this;
    document.querySelectorAll("#status")[0].innerHTML = message;
}

window.onload = function () {
    localStorage.clear();
    test = new FingerprintSdkTest();
    readersDropDownPopulate(false); //To populate readers for drop down selection
    disableEnable(); // Disabling enabling buttons - if reader not selected

};


function onStart() {
    if (currentFormat === "") {
        alert("Please select a format.")
    } else {
        test.startCapture();
    }
}

function onStop() {
    test.stopCapture();
}

function onGetInfo() {
    var allReaders = test.getInfo();
    allReaders.then(function (sucessObj) {
        populateReaders(sucessObj);
    }, function (error) {
        showMessage(error.message);
    });
}

function onDeviceInfo(id, element) {
    var myDeviceVal = test.getDeviceInfoWithID(id);
    myDeviceVal.then(function (sucessObj) {
        var deviceId = sucessObj.DeviceID;
        var uidTyp = deviceUidType[sucessObj.eUidType];
        var modality = deviceModality[sucessObj.eDeviceModality];
        var deviceTech = deviceTechn[sucessObj.eDeviceTech];
        document.getElementById(element).innerHTML = "Id : " + deviceId
            + "<br> Uid Type : " + uidTyp
            + "<br> Device Tech : " + deviceTech
            + "<br> Device Modality : " + modality;

    }, function (error) {
        showMessage(error.message);
    });

}

function onClear() {
    var vDiv = document.getElementById('imagediv');
    vDiv.innerHTML = "";
    localStorage.setItem("imageSrc", "");
    localStorage.setItem("wsq", "");
    localStorage.setItem("raw", "");
    localStorage.setItem("intermediate", "");
}


$("#save").on("click", function () {
    if (localStorage.getItem("imageSrc") === "" ||
        localStorage.getItem("imageSrc") == null ||
        document.getElementById('imagediv').innerHTML === "") {
        alert("Error -> Fingerprint not available");
    } else {
        var vDiv = document.getElementById('imageGallery');
        if (vDiv.children.length < 5) {
            var image = document.createElement("img");
            image.id = "galleryImage";
            image.className = "img-thumbnail";
            image.src = localStorage.getItem("imageSrc");
            vDiv.appendChild(image);

            localStorage.setItem("imageSrc" + vDiv.children.length, localStorage.getItem("imageSrc"));
        } else {
            document.getElementById('imageGallery').innerHTML = "";
            $("#save").click();
        }
    }
});

function populateReaders(readersArray) {
    var _deviceInfoTable = document.getElementById("deviceInfo");
    _deviceInfoTable.innerHTML = "";
    if (readersArray.length !== 0) {
        _deviceInfoTable.innerHTML += "<h4>Available Readers</h4>"
        for (i = 0; i < readersArray.length; i++) {
            _deviceInfoTable.innerHTML +=
                "<div id='dynamicInfoDivs' align='left'>" +
                "<div data-toggle='collapse' data-target='#" + readersArray[i] + "'>" +
                "<img src='images/info.png' alt='Info' height='20' width='20'> &nbsp; &nbsp;" + readersArray[i] + "</div>" +
                "<p class='collapse' id=" + '"' + readersArray[i] + '"' + ">" + onDeviceInfo(readersArray[i], readersArray[i]) + "</p>" +
                "</div>";
        }
    }
};

function sampleAcquired(s) {
    if (currentFormat === Fingerprint.SampleFormat.PngImage) {
        // If sample acquired format is PNG- perform following call on object recieved
        // Get samples from the object - get 0th element of samples as base 64 encoded PNG image
        localStorage.setItem("imageSrc", "");
        var samples = JSON.parse(s.samples);
        localStorage.setItem("imageSrc", "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]));
        var vDiv = document.getElementById('imagediv');
        vDiv.innerHTML = "";
        var image = document.createElement("img");
        image.id = "image";
        image.src = localStorage.getItem("imageSrc");
        vDiv.appendChild(image);
    }
    else {
        alert("Format Error");
    }
}

function readersDropDownPopulate(checkForRedirecting) { // Check for redirecting is a boolean value which monitors to redirect to content tab or not
    myVal = "";
    var allReaders = test.getInfo();
    allReaders.then(function (sucessObj) {
        var readersDropDownElement = document.getElementById("readersDropDown");
        readersDropDownElement.innerHTML = "";
        //First ELement
        var option = document.createElement("option");
        option.selected = "selected";
        option.value = "";
        option.text = "Select Reader";
        readersDropDownElement.add(option);
        for (i = 0; i < sucessObj.length; i++) {
            var option = document.createElement("option");
            option.value = sucessObj[i];
            option.text = sucessObj[i];
            readersDropDownElement.add(option);
        }

        //Check if readers are available get count and  provide user information if no reader available,
        //if only one reader available then select the reader by default and sennd user to capture tab
        checkReaderCount(sucessObj, checkForRedirecting);

    }, function (error) {
        showMessage(error.message);
    });
}

function checkReaderCount(sucessObj, checkForRedirecting) {
    if (sucessObj.length == 0) {
        alert("No reader detected. Please insert a reader.");
    } else if (sucessObj.length == 1) {
        document.getElementById("readersDropDown").selectedIndex = "1";
        if (checkForRedirecting) {
            setActive('Capture', 'Reader'); // Set active state to capture
        }
    }
    selectChangeEvent(); // To make the reader selected
}

function selectChangeEvent() {
    var readersDropDownElement = document.getElementById("readersDropDown");
    myVal = readersDropDownElement.options[readersDropDownElement.selectedIndex].value;
    disableEnable();
    onClear();
    document.getElementById('imageGallery').innerHTML = "";

    //Make capabilities button disable if no user selected
    if (myVal == "") {
        $('#capabilities').prop('disabled', true);
    } else {
        $('#capabilities').prop('disabled', false);
    }
}


//Enable disable buttons
function disableEnable() {
    if (myVal != "") {
        disabled = false;
        $('#start').prop('disabled', false);
        $('#stop').prop('disabled', false);
        showMessage("");
    } else {
        disabled = true;
        $('#start').prop('disabled', true);
        $('#stop').prop('disabled', true);
        showMessage("Please select a reader");
        onStop();
    }
}


function setActive(element1, element2) {
    document.getElementById(element2).className = "";
    // And make this active
    document.getElementById(element1).className = "active";

}
