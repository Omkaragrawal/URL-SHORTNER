let editLinkModal;
let modal1;

document.addEventListener('DOMContentLoaded', function () {
    const elems = document.querySelectorAll('.modal');
    const instances = M.Modal.init(elems, {
        opacity: 0.7,
        preventScrolling: true,
        dismissible: false,
        onCloseStart: (_event) => {
            document.getElementById('customizeURL').reset();
            document.getElementById('editURL').reset();
        }
    });
    modal1 = M.Modal.getInstance(document.getElementById('submitURL'));
    editLinkModal = M.Modal.getInstance(document.getElementById("editLinkModal"));
});

const dataTable = (data) => {
    const columns = ["id", "shortend", "actual_link", "creation_date", "total_clicks"];

    let table = document.createElement("table");
    table.classList = "responsive-table centered highlight";
    let tHead = document.createElement('thead');
    let headerTR = document.createElement('tr');
    columns.forEach(headerName => {
        let th = document.createElement('th');
        th.innerText = headerName;
        headerTR.appendChild(th);
    });

    tHead.appendChild(headerTR);
    table.appendChild(tHead);

    let tBody = document.createElement("tbody");
    data.forEach(linkEntry => {
        let dataTr = document.createElement("tr");
        dataTr.id = linkEntry.id;

        let tdElem = document.createElement('td');
        tdElem.innerText = linkEntry.id;
        dataTr.appendChild(tdElem);

        tdElem = document.createElement('td');
        tdElem.innerHTML = `<a href = "${document.location.origin}/${linkEntry.shortend}" target="__blank">${linkEntry.shortend}</a>`;
        dataTr.appendChild(tdElem);

        tdElem = document.createElement('td');
        tdElem.innerHTML = `<a href = "${linkEntry.actual_link}" target="__blank">${linkEntry.actual_link}</a>`;
        dataTr.appendChild(tdElem);

        tdElem = document.createElement('td');
        tdElem.innerText = linkEntry.creation_date;
        dataTr.appendChild(tdElem);

        tdElem = document.createElement('td');
        tdElem.innerText = linkEntry.total_clicks;
        dataTr.appendChild(tdElem);

        tdElem = document.createElement('td');
        tdElem.innerHTML = `<button onclick="editLink(${linkEntry.id})" class="btn-large waves-effect waves-dark col s12 center-align">Edit URL</button>`;
        dataTr.appendChild(tdElem);

        tBody.appendChild(dataTr);
    });

    table.appendChild(tBody);
    return table;
}

const getAllData = _event => {
    document.getElementById('displayData').innerHTML = "";
    axios.get('/allLinks').then(({
        data
    }) => {
        document.getElementById('displayData').appendChild(dataTable(data));
    })
}

const editLink = (id) => {
    const tr = document.getElementById(id).children;
    const editID = tr.item(0).innerText,
        short = tr.item(1).innerText,
        ocLink = tr.item(2).innerText;
    document.getElementById("editID").value = editID;
    document.getElementById("editLong").value = ocLink;
    document.getElementById("editCustomShort").value = short;
    editLinkModal.open();
    document.getElementById("editCustomShort").focus();
    document.getElementById("editCustomShort").disabled = true;
    document.getElementById("editLong").focus();
}

const checkValue = event => {
    if (event.srcElement.checked) {
        document.getElementById('customInput').hidden = false;
    } else if (!event.srcElement.checked) {
        document.getElementById('customInput').hidden = true;
    }
}

const validateForm = event => {
    event.preventDefault();
    const toShorten = event.srcElement.toShorten;
    const toCustomize = event.srcElement.isCustomURL
        let params;
        if (!toCustomize.checked) {
            params = {
                customShortner: false,
                toShorten: toShorten.value
            }
        } else if (toCustomize.checked) {
            params = {
                customShortner: event.srcElement.customShortner.value,
                toShorten: toShorten.value
            }
        }
        
        axios.post('/createLink', params)
            .then(({
                data
            }) => {
                if (data.alreadyExist) {
                    customShortner.focus();
                    M.toast({
                        html: "Already Exists, Please enter a different shortner"
                    });
                    customShortner.value = ""
                    customShortner.checkValidity()
                } else if (data.success) {
                    // const modal = M.Modal.getInstance(document.getElementById('submitURL'));
                    modal1.close();
                    document.getElementById('customInput').hidden = true;
                    (function toClipboard(text = `${document.location.origin}/${data.shortLink}`) {
                        if (!navigator.clipboard) {
                            window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
                          return;
                        }
                        navigator.clipboard.writeText(text).then(function() {
                          M.toast({
                              html: "COPIED",
                              displayLength: 1000
                          })
                        }, function(err) {
                          console.error('Async: Could not copy text: ', err);
                          window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
                        }).catch(() => window.prompt("Copy to clipboard: Ctrl+C, Enter", text));
                    })()
                    M.toast({
                        html: `<pre>SHORT Link is Created <b class="yellow-text text-darken-1" id="copyShort">${data.shortLink}</b></pre>`,
                        displayLength: 2000
                    });
                    // alert(`The short link is:  ${document.location.origin}/${data.shortLink} `);
                } else {
                    console.log(data);
                }
            })
            .catch(err => console.log(err));
}

const validateEdit = event => {
    event.preventDefault();

    const toEditID = event.srcElement[0].value,
        newLink = event.srcElement[1].value,
        newShort = event.srcElement[2].value;
    const ocLink = document.getElementById(toEditID).children.item(2).innerText;
    if (ocLink == newLink) {
        M.toast({
            html: "<h6><b>No changes made, change the link and try again.</b></h6>",
            classes: "red-text text-darken-4",
            displayLength: 1000
        });
        document.getElementById("editLong").focus();
    } else {
        const customShortner = event.srcElement.customShortner
        axios.post('/changeShort', {
                linkID: toEditID,
                short: newShort,
                newLink: newLink
            }).then(({
                data: {
                    success = false,
                    results,
                    fields = false
                }
            }) => {
                if (success) {
                    const linkInTable = document.getElementById(toEditID).children.item(2).children.item(0);
                    linkInTable.href = newLink;
                    linkInTable.innerText = newLink;
                    document.getElementById(toEditID).children.item(3).innerText = new Date().toISOString();
                    document.getElementById(toEditID).children.item(4).innerText = 0;
                    editLinkModal.close();
                    M.toast({
                        html: "<h6><b>Changes saved Successfully.</b></h6>",
                        classes: "teal-text text-accent-14",
                        displayLength: 2000
                    });
                } else if (!success) {
                    M.toast({
                        html: `<h6><b>${results}</b></h6>`,
                        classes: "red-text text-darken-4",
                        displayLength: 1000
                    });
                } else {
                    M.toast({
                        html: `<h6><b>${success}</b></h6>`,
                        classes: "red-text text-darken-4",
                        displayLength: 1000
                    });
                    M.toast({
                        html: `<h6><b>${results}</b></h6>`,
                        classes: "red-text text-darken-4",
                        displayLength: 1000
                    });
                    M.toast({
                        html: `<h6><b>${fields}</b></h6>`,
                        classes: "red-text text-darken-4",
                        displayLength: 1000
                    });
                }
            })
            .catch(err => {
                alert(err);
                if (err.response.status == 400) {
                    M.toast({
                        html: `<h6><b>${err.response.data} <br> Please refresh the page and try again</b></h6>`,
                        classes: "red-text text-darken-4",
                        displayLength: 2000
                    });
                  } else {
                    M.toast({
                        html: `<h6><b>${err.response.data} <br> Please refresh the page and try again</b></h6>`,
                        classes: "red-text text-darken-4",
                        displayLength: 2000
                    });
                  }
            });
    }

}