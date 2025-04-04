async function getStudentDetailsOnLoad() {
    let username = document.querySelector('.user-name');
    let userBatch = document.querySelector('.user-batch');
    let profileName = document.querySelector('.profile-name');
    let profileAdmissionNo = document.querySelector('.profile-admission');
    let profileDept = document.querySelector('.profile-department');

    let id = localStorage.getItem('userId');
    let loginAdmissionNo = localStorage.getItem('admissionNo');

    try {
        // Fetch user details from API
        const response = await fetch(`http://localhost:3000/api/user/add/get-user/${id}`);
        const user = await response.json();

        if (!user || !user.userFullName) {
            console.error('User not found or invalid response.');
            return;
        }

        // Set values in the profile section
        username.innerHTML = `${user.userFullName}`;
        profileName.innerHTML = `${user.userFullName}`;
        
        // Check for batchRef and batchName
        if (user.batchRef && user.batchRef.batchName) {
            userBatch.innerHTML = `${user.batchRef.batchName}`;
        } else {
            userBatch.innerHTML = `Batch Not Assigned`;
        }

        // Set Admission Number
        profileAdmissionNo.innerHTML = `Admission No : ${loginAdmissionNo || 'N/A'}`;

        // Check for departmentRef and department name
        if (user.departmentRef && user.departmentRef.departmentShortName) {
            profileDept.innerHTML = `${user.departmentRef.departmentShortName}`;
        } else {
            profileDept.innerHTML = `Department Not Assigned`;
        }

    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}

async function getAllElectionDropdown() {
    try {
        // Fetch election data from API
        const response = await fetch("http://localhost:3000/api/election/list-election");
        const electionData = await response.json();

        // Get the select element for election and position
        const electionSelect = document.querySelector("#electionSelect");
        const positionSelect = document.querySelector("#positionSelect");

        // Clear existing options in electionSelect
        electionSelect.innerHTML = `<option value="" disabled selected>Select an election</option>`;

        // Check if any elections are available
        if (electionData.length === 0) {
            electionSelect.innerHTML += `<option value="" disabled>No elections available</option>`;
            return;
        }

        electionData.forEach(election => {
            const option = document.createElement('option');
            option.value = election._id; 
            option.textContent = `${election.electionName} - ${election.electionRole}`; 
            electionSelect.appendChild(option);
        });

        electionSelect.addEventListener('change', function () {
            const selectedElection = electionData.find(
                election => election._id === this.value
            );

            if (selectedElection) {
                positionSelect.innerHTML = `
                    <option value="${selectedElection.electionRole}" selected>${selectedElection.electionRole}</option>
                `;
                positionSelect.disabled = true;
            }
        });

    } catch (error) {
        console.error("Error fetching election data:", error);
    }
}

// async function submitNomination(e){
//     e.preventDefault();
//     const electionId = document.querySelector("#electionSelect").value;
//     const nominatedPosition = document.querySelector("#positionSelect").value;
//     const nomineeStatement = document.querySelector("#nominationStatement").value.trim();
//     const hasBacklogs = document.querySelector('input[name="hasBacklogs"]:checked').value;
//     const backlogNumber = hasBacklogs === "yes" ? parseInt(document.querySelector("#backlogsCount").value) : 0;

//     // Validate required fields
//     if (!electionId || !nominatedPosition || !nomineeStatement) {
//         showToast("Please fill all required fields!",'danger');
//         return;
//     }

//     if (hasBacklogs === "yes" && (!backlogNumber || backlogNumber <= 0)) {
//         showToast("Please enter a valid number of backlogs.",'danger');
//         return;
//     }

//     // Prepare nomination data object
//     const nominationData = {
//         nomineeId: localStorage.getItem("userId"), // Assuming nominee's ID is stored in localStorage
//         nominatedElection: electionId,
//         nominatedPosition: nominatedPosition,
//         nomineeStatement: nomineeStatement,
//         isBacklog: hasBacklogs === "yes",
//         backlogNumber: hasBacklogs === "yes" ? backlogNumber : 0
//     };

//     try {
//         // Send nomination data to backend
//         const response = await fetch("http://localhost:3000/api/nomination/sent-nomination", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(nominationData)
//         });

//         // Handle response
//         if (response.ok) {
//             const result = await response.json();
//             showToast("Nomination submitted successfully!",'success');
//             resetNominationForm(); // Clear form after submission
//         } else {
//             const errorData = await response.json();
//             showToast(` Error: ${errorData.error || "Unable to submit nomination."}`,'danger');
//         }
//     } catch (error) {
//         console.error("Error submitting nomination:", error);
//         showToast(" An error occurred while submitting your nomination. Please try again.",'danger');
//     }

// }

// function resetNominationForm() {
//     document.querySelector("#nominationForm").reset(); // Clear the form
//     document.querySelector("#positionSelect").disabled = false; // Enable position dropdown
//     document.querySelector("#backlogsField").style.display = "none"; // Hide backlogs field
// }

// document.querySelectorAll('input[name="hasBacklogs"]').forEach((radio) => {
//     radio.addEventListener("change", function () {
//         const backlogsField = document.querySelector("#backlogsField");
//         if (this.value === "yes") {
//             backlogsField.style.display = "block";
//         } else {
//             backlogsField.style.display = "none";
//         }
//     });
// });

// Hide backlog field initially
// document.querySelector("#backlogsField").style.display = "none";

 // Toast notification function
 function showToast(message, type) {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Auto remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}


// Fetch nominations when the page loads
document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId"); // Get userId from localStorage
    if (!userId) {
        console.error("User ID not found!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/nomination/get-user-nomination/${userId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch nominations");
        }

        const nominations = await response.json();  
        renderNominationCards(nominations);
    } catch (err) {
        console.error("Error fetching nominations:", err.message);
    }
});

// Function to render nomination cards dynamically
function renderNominationCards(nominations) {
    const nominationContainer = document.getElementById("nominationCards");
    nominationContainer.innerHTML = "";

    if (nominations.length === 0) {
        nominationContainer.innerHTML = `<p>No nominations found!</p>`;
        return;
    }

    nominations.forEach((nomination) => {
        const statusInfo = getNominationStatus(nomination);
        const cardHTML = `
            <div class="nomination-card ${statusInfo.cardClass}">
                <div class="nomination-card-header">
                    <h4 class="nomination-card-title">${nomination.nomineeElection.electionName}</h4>
                    <span class="nomination-status ${statusInfo.statusClass}">${statusInfo.statusText}</span>
                </div>
                <div class="nomination-card-body">
                    <div class="nomination-info">
                        <div class="nomination-avatar">
                            <img src="${nomination.nomineeName.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg'}" alt="${nomination.nomineeName.userFullName}">
                        </div>
                        <div class="nomination-details">
                            <h4 class="nomination-name">${nomination.nomineeName.userFullName}</h4>
                            <p class="nomination-position">${nomination.nominatedRole}</p>
                        </div>
                    </div>
                    <div class="election-details">
                        <div class="election-detail">
                            
                        </div>
                        ${statusInfo.detailHTML}
                    </div>
                    ${statusInfo.rejectionHTML}
                </div>
            </div>`;
        nominationContainer.innerHTML += cardHTML;
    });
}

// Function to determine nomination status and return relevant info
function getNominationStatus(nomination) {
    if (nomination.nominationStatus === true) {
        return {
            cardClass: "approved",
            statusClass: "status-approved",
            statusText: "Approved",
            detailHTML: `
                <div class="election-detail">
                    <span class="detail-label">Approved On:</span>
                    <span class="detail-value">${formatDate(nomination.updatedAt)}</span>
                </div>`,
            rejectionHTML: ""
        };
    } else if (nomination.nominationStatus === false) {
        return {
            cardClass: "rejected",
            statusClass: "status-rejected",
            statusText: "Rejected",
            detailHTML: `
                <div class="election-detail">
                    <span class="detail-label">Rejected On:</span>
                    <span class="detail-value">${formatDate(nomination.updatedAt)}</span>
                </div>`,
            rejectionHTML: `
                <div class="rejection-reason">
                    <div class="rejection-reason-title">
                        <i class="fas fa-exclamation-circle"></i> Reason for Rejection
                    </div>
                    <p>${nomination.nomineeRejectReason || "No reason provided."}</p>
                </div>`
        };
    } else {
        return {
            cardClass: "pending",
            statusClass: "status-pending",
            statusText: "Pending",
            detailHTML: `
                <div class="election-detail">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">Under Review</span>
                </div>`,
            rejectionHTML: ""
        };
    }
}

// Format date function
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}


async function loadCurrentElectionForVoting() {
    try {
        const response = await fetch('http://localhost:3000/api/election/get-started-election');
        if (!response.ok) throw new Error("Failed to fetch elections");

        const elections = await response.json();
        const electionContainer = document.querySelector('.election-cards');
        electionContainer.innerHTML = ''; // Clear previous data

        if (!elections || elections.length === 0) {
            electionContainer.innerHTML = '<p class="no-elections">No ongoing elections.</p>';
            return;
        }

        elections.forEach(election => {
            if (election.isTerminated) return; // 🔹 Skip terminated elections

            const card = document.createElement('div');
            card.classList.add('election-card');

            card.innerHTML = `
                <div class="election-card-header">
                    ${election.electionName} (${election.electionRole})
                </div>
                <div class="election-card-body">
                    <div class="election-details">
                        <div class="election-detail">
                            <span class="detail-label">Election Name:</span>
                            <span class="detail-value">${election.electionName}</span>
                        </div>
                        <div class="election-detail">
                            <span class="detail-label">Ends In:</span>
                            <span class="detail-value" id="timer-${election._id}"></span>
                        </div>
                        <div class="election-detail">
                            <span class="detail-label">Venue:</span>
                            <span class="detail-value">${election.electionVenue}</span>
                        </div>
                    </div>

                    <div class="nominee-container">
                        <h4>Nominees</h4>
                        <div class="nominee-list" id="nominee-list-${election._id}"></div>
                    </div>
                </div>
            `;

            electionContainer.appendChild(card);

            // 🔹 Populate nominees
            const nomineeList = document.getElementById(`nominee-list-${election._id}`);
            if (election.electionNominee.length > 0) {
                election.electionNominee.forEach(nominee => {
                    const nomineeCard = document.createElement('div');
                    nomineeCard.classList.add('nominee-info');
                    nomineeCard.innerHTML = `
                        <div class="nominee-avatar">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="${nominee.nomineeId?.userFullName || 'Unknown'}">
                        </div>
                        <div class="nominee-details">
                            <h5 class="nominee-name">${nominee.nomineeName.userFullName || 'Unknown'}</h5>
                            <p class="nominee-role">${nominee.nominationId?.nominatedRole || 'Candidate'}</p>
                        </div>
                        <div class="nominee-description" style="margin-top:0px;">
                            ${nominee.nominationId?.nomineeStatement || 'No statement provided'}
                        </div>
                        <div class="election-card-footer">
                            <button class="vote-button" 
                                onclick="castVote('${nominee._id}', '${election._id}', '${nominee.nomineeName?.userFullName}')">
                                Vote
                            </button>

                        </div>
                    `;
                    nomineeList.appendChild(nomineeCard); // ✅ Append nominees correctly
                });
            } else {
                nomineeList.innerHTML = "<p class='no-nominees'>No nominees yet.</p>";
            }

            // 🔹 Start real-time countdown
            const timerElement = document.getElementById(`timer-${election._id}`);
            calculateRemainingTime(election.electionTo, timerElement, election._id);
        });

    } catch (error) {
        console.error("Error loading elections:", error);
        document.querySelector('.election-cards').innerHTML = '<p class="no-elections">No ongoing elections.</p>';
    }
}


// 🔹 Automatically refresh elections every 10 seconds
setInterval(loadCurrentElectionForVoting, 60000);

function calculateRemainingTime(electionEndTime, element, electionId) {
    let interval;

    function updateTime() {
        const now = new Date().getTime();
        const endTime = new Date(electionEndTime).getTime();
        const diff = endTime - now;

        if (diff <= 0) {
            element.innerText = "Election ended";
            clearInterval(interval); // Stop countdown when election ends

            // 🔹 Refresh the UI immediately when an election ends
            setTimeout(loadCurrentElectionForVoting, 3000);
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        element.innerText = `${hours}h ${minutes}m ${seconds}s`;
    }

    updateTime();
    interval = setInterval(updateTime, 1000);
}

async function castVote(nomineeId, electionId, nomineeName) {
    const confirmation = await Swal.fire({
        title: "Confirm Vote",
        text: `Are you sure you want to vote for ${nomineeName}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, Vote!",
    });

    if (confirmation.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:3000/api/election/cast-vote/${electionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nomineeId, userId: localStorage.getItem('userId') }) 
            });

            const data = await response.json();

            if (response.ok) {
                showToast( data.message, "success");
            } else {
                showToast( data.message || "Voting failed", "danger");
            }
        } catch (err) {
            console.error(err);
            showToast("An error occurred while casting your vote.", "danger");
        }
    }
}


// Function to update the UI with the new vote count
function updateVoteCount(nomineeId, newVoteCount) {
    const nomineeElement = document.querySelector(`#nominee-${nomineeId} .vote-count`);
    if (nomineeElement) {
        nomineeElement.innerText = `Votes: ${newVoteCount}`;
    }
}


