

async function getAllBatches() {
    try{
        const batches = await fetch("http://localhost:3000/api/batch/get-all-batch");
        const batchData = await batches.json();
        console.log(batchData);
        electionBatch.innerHTML=`<option selected disabled>Select Batch</option>`;
        batchData.forEach(batch => {
                let option = document.createElement("option");
                option.value = batch._id;
                option.textContent = batch.batchName;
                electionBatch.appendChild(option);
            });
    }catch(err){
        console.error("Error fetching batches:", error);           
    }

}


async function getAllFaculty() {
    try{
        const faculty = await fetch("http://localhost:3000/api/user/add/get-all-faculty");
        const facultyData = await faculty.json();
        console.log(facultyData);
        electionDuty.innerHTML=`<option selected disabled>Select Batch</option>`;
        facultyData.forEach(faculty => {
                let option = document.createElement("option");
                option.value = faculty._id;
                option.textContent = faculty.userFullName;
                electionDuty.appendChild(option);
            });
    }catch(error){
        console.error("Error fetching batches:", error);           
    }

}

async function getAllElection() {
    try {
        const response = await fetch("http://localhost:3000/api/election/list-election");
        const electionData = await response.json();
        const electionTableBody = document.querySelector(".elections-table tbody");

        electionTableBody.innerHTML = '';

        if (electionData.length === 0) {
            electionTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">No elections found!</td>
                </tr>
            `;
            return;
        }

            electionData.forEach(election => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${election.electionName}</td>
                    <td>${election.electionRole}</td>
                    <td>${formatDateTime(election.electionFrom)}</td>
                    <td>${formatDateTime(election.electionTo)}</td>
                    <td>${election.electionDuty.userFullName}</td>
                    <td>${election.electionVenue}</td>
                    <td>
                        <div class="election-actions">
                            <button class="election-action edit" onclick="editElection('${election._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="election-action delete" onclick="deleteElection('${election._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                electionTableBody.appendChild(row);
            });

        } catch (error) {
            console.error("Error fetching election data:", error);
        }
    }



    ////////////////////////////////////////////////////////////////////////////////////
    //for voter page
    ///////////////////////////////////////////////////////////////////////////////////

    async function fetchVoterListForApproval() {
        const isTutor = localStorage.getItem('isTutor'); // String value, "true" or "false"
        const departmentRef = localStorage.getItem('userDepartment');
        const voterTableBody = document.querySelector(".voter-data-table tbody");
        console.log("isTutor:", isTutor);
        console.log("deparmtent:", departmentRef);
    
        try {
            let source = 'voter_approval';
            let url = `http://localhost:3000/api/user/add/get-all-voters`;

            if (departmentRef) {
                url += `?departmentRef=${departmentRef}`;  // First query uses '?'
                if (source) {
                    url += `&source=${source}`;  // Additional queries use '&'
                }
            } else if (source) {
                url += `?source=${source}`;  // If no departmentRef, start with '?'
            }


            const response = await fetch(url);
            const voters = await response.json();
    
            voterTableBody.innerHTML = "";
            if (voters.length == 0) {
                const noRequestRow = document.createElement("tr");
                noRequestRow.innerHTML = `
                    <td colspan="4" style="text-align: center; color: gray;">No pending voter requests</td>
                `;
                voterTableBody.appendChild(noRequestRow);
                const pendingReqCount = document.querySelector('.pending-request-val');
                if (pendingReqCount) {
                    pendingReqCount.innerHTML = `0`;
                    const pendingReqDetails = document.querySelector('.pending-request-details');
                    if(pendingReqDetails){
                        pendingReqDetails.innerHTML = `<i class="fas fa-check-circle change-icon change-positive"></i> No request pending!`
                    }   
                }
                return;
            }

            let voterPendingCount = voters.length || 0;
            let pendingReq = document.querySelector('.pending-request-val');
            pendingReq.innerHTML = `${voterPendingCount}`;
            const pendingReqDetails = document.querySelector('.pending-request-details');
            if(pendingReqDetails){
                pendingReqDetails.innerHTML = `<i class="fas fa-exclamation-circle change-icon change-negative"></i> Requires Attention!`
            }
    
            if (isTutor !== "true" || isTutor === null) {
                const notFacultyRow = document.createElement("tr");
                notFacultyRow.innerHTML = `
                    <td colspan="4" style="text-align: center;">You are not a Tutor</td>
                `;
                voterTableBody.appendChild(notFacultyRow);
                return;
            }
    
            voters.forEach(voter => {
                if (!voter.isVoter) {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${voter.userFullName}</td>
                        <td>${voter.batchRef?.batchName || "N/A"}</td>
                        <td>${voter.studentAdmissionNumber}</td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action approve" onclick="approveVoter('${voter._id}', '${voter.userFullName}')">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="table-action reject" onclick="rejectVoter('${voter._id}', '${voter.userFullName}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    voterTableBody.appendChild(row);
                }
            });
        } catch (error) {
            console.error("Error fetching voters:", error);
        }
    }

    function updateProfileInfo() {
        let profileName = localStorage.getItem('userName');
        let profileRole = localStorage.getItem('role');
    
        if (profileRole === 'Faculty') {
            let profileNameElements = document.getElementsByClassName('user-name');
            let profileRoleElements = document.getElementsByClassName('user-role');
    
            // Update the first matched element (assuming only one exists)
            if (profileNameElements.length > 0) {
                profileNameElements[0].innerHTML = `${profileName}`;
            }
    
            if (profileRoleElements.length > 0) {
                profileRoleElements[0].innerHTML = `${profileRole}`;
            }
        }
    }

    async function getElectionSchedule() {
        try {
            const response = await fetch("http://localhost:3000/api/election/approved-election");
            const electionData = await response.json();
            const electionTableBody = document.querySelector(".election-schedule tbody");

            let commencedElections = [];
            let mostRecentCommencedElection = null;

            electionTableBody.innerHTML = '';
    
            if (electionData.length === 0) {
                electionTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center;">No elections found!</td>
                    </tr>
                `;
                return;
            }
    
                electionData.forEach(election => {
                    const row = document.createElement('tr');
                    const daysUntilStart = calculateDaysUntil(election.electionFrom);

                    const hasCommenced = hasElectionCommenced(election.electionFrom);
                    const hasEnded = hasElectionEnded(election.electionTo);

                    console.log(hasCommenced);
                    console.log(hasEnded);
                    console.log(election);
                    if (hasCommenced && hasEnded) {
                        commencedElections.push(election);
                    }
                    row.innerHTML = `
                        <td>${election.electionName}</td>
                        <td>${election.electionRole}</td>
                        <td>${election.electionBatch.batchName}</td>
                        <td>${daysUntilStart}</td> 
                        <td>${election.electionDuty.userFullName}</td>
                        <td>${election.electionVenue}</td>
                    `;
                    electionTableBody.appendChild(row);
                });
                if (commencedElections.length > 0) {
                    commencedElections.sort((a, b) => new Date(b.electionFrom) - new Date(a.electionFrom)); // Sort by most recent commencement
                    mostRecentCommencedElection = commencedElections[0];
                }

                updateCommencedInfo(commencedElections.length, mostRecentCommencedElection);
    
            } catch (error) {
                console.error("Error fetching election data:", error);
            }
        }


        function calculateDaysUntil(electionFrom) {
            const today = new Date(); // Current date
            const electionDate = new Date(electionFrom); // Convert electionFrom to Date object
        
            const timeDiff = electionDate - today; // Difference in milliseconds
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert to days
        
            if (daysDiff > 1) {
                return `Commences in ${daysDiff} days`;
            } else if (daysDiff === 1) {
                return `Commences tomorrow`;
            } else if (daysDiff === 0) {
                return `Commences today`;
            } else {
                var commencedArr = [];
                commencedArr.push()
                return `Already commenced`;
            }
        }
        
        // Helper function to format date and time
        function formatDateTime(dateTimeString) {
            const date = new Date(dateTimeString);
            return date.toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }


        async function fetchAllVoterCount() {
            try {
                let source = 'voter_approval';
                let url = `http://localhost:3000/api/user/add/get-all-voters`;
    
    
                const response = await fetch(url);
                const voters = await response.json();
                let allVoterCount = voters.length || '';
                allVoterHTML = document.querySelector('.total-voters-val');

                if(allVoterHTML){
                    allVoterHTML.innerHTML = `${allVoterCount}`;
                }
        
            
            } catch (error) {
                console.error("Error fetching voters:", error);
            }
        }

        function hasElectionCommenced(electionFrom) {
            const today = new Date();
            const startDate = new Date(electionFrom);
            return today >= startDate;
        }
        
        // Check if the election has already ended
        function hasElectionEnded(electionTo) {
            const today = new Date();
            const endDate = new Date(electionTo);
            return today > endDate;
        }

        function updateCommencedInfo(commencedCount, mostRecentElection) {
            console.log(commencedCount);
            // Update the count of commenced elections
            const commencedCountElement = document.querySelector(".election-complete-val");
            if (commencedCountElement) {
                commencedCountElement.innerHTML = `${commencedCount}`;
            }
        
            // Update the most recently commenced election name
            const mostRecentElectionElement = document.querySelector(".election-complete-details");
            if (mostRecentElectionElement) {
                if (mostRecentElection) {
                    mostRecentElectionElement.innerHTML = `
                        <i class="fas fa-calendar-check change-icon change-positive"></i>
                        Last: ${formatDateTime(mostRecentElection.electionFrom)}
                    `;
                } else {
                    mostRecentElectionElement.innerHTML = `<p>No commenced elections.</p>`;
                }
            }
        }


        async function assignedElections() {
            const facultyId = localStorage.getItem('userId'); // Make sure this is the correct key
            try {
                // Fetch assigned elections using GET
                const response = await fetch(`http://localhost:3000/api/election/assigned-election/${facultyId}`);
                
                // Await the response
                const data = await response.json();
                console.log(data);
        
                // Get assigned election count
                const assignedCount = data.length || 0;
                console.log("Assigned Elections Count:", assignedCount);
        
                // Update assigned count in HTML
                const assignedHTML = document.querySelector('.assigned-election-val');
                if (assignedHTML) {
                    assignedHTML.innerHTML = `${assignedCount}`;
                }
        
                // Handle if no elections are assigned
                const assignedHTMLDetails = document.querySelector('.assigned-details');
                if (assignedCount === 0 && assignedHTMLDetails) {
                    assignedHTMLDetails.innerHTML = `
                        <i class="fas fa-arrow-up change-icon change-positive"></i>
                        No elections Assigned
                    `;
                } else if (assignedCount > 0 && assignedHTMLDetails) {
                    assignedHTMLDetails.innerHTML = `
                        <i class="fas fa-exclamation-circle change-icon change-negative"></i>
                        Please verify the elections!
                    `;
                }
        
            } catch (error) {
                console.error("Error fetching assigned election data:", error);
            }
        }



        async function fetchVoterListAll() {
            const isTutor = localStorage.getItem("isTutor");
            const departmentRef = localStorage.getItem("userDepartment");
            const batchRef = localStorage.getItem("batchRef");
        
            const voterTableBody = document.querySelector(".all-voter-details tbody");
            console.log("isTutor:", isTutor);
            console.log("batchRef:", batchRef);
        
            try {
                let source = "voter_all";
                let url = new URL("http://localhost:3000/api/user/add/get-all-voters");
                let params = {};
        
                if (departmentRef) params["departmentRef"] = departmentRef;
                if (source) params["source"] = source;
                if (source) params["batchRef"] = batchRef;
        
                url.search = new URLSearchParams(params).toString();
        
                const response = await fetch(url);
                const voters = await response.json();
        
                voterTableBody.innerHTML = "";
                
                if (voters.length === 0) {
                    const noRequestRow = document.createElement("tr");
                    noRequestRow.innerHTML = `
                        <td colspan="4" style="text-align: center; color: gray;">No pending voter requests</td>
                    `;
                    voterTableBody.appendChild(noRequestRow);
                    return;
                }
        
                if (isTutor !== "true" || !isTutor) {
                    const notFacultyRow = document.createElement("tr");
                    notFacultyRow.innerHTML = `
                        <td colspan="4" style="text-align: center;">You are not a Tutor</td>
                    `;
                    voterTableBody.appendChild(notFacultyRow);
                    return;
                }
        
                voters.forEach((voter) => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${voter.userFullName}</td>
                            <td>${voter.batchRef?.batchName || "N/A"}</td>
                            <td>${voter.studentAdmissionNumber}</td>
                            <td>
                                <span class="status-badge ${
                                    voter.isVoter ? "status-approved" : "status-rejected"
                                }">
                                    ${voter.isVoter ? "Approved" : "Rejected"}
                                </span>
                            </td>
                        `;
                        voterTableBody.appendChild(row);
                    });
        
                // Show empty row if no rows added
                if (voterTableBody.children.length === 0) {
                    const emptyRow = document.createElement("tr");
                    emptyRow.innerHTML = `
                        <td colspan="4" style="text-align: center; color: gray;">No voter data available</td>
                    `;
                    voterTableBody.appendChild(emptyRow);
                }
            } catch (error) {
                console.error("Error fetching voters:", error);
            }
        }

        async function fetchElectionCards() {
            const id = localStorage.getItem('userId') 
            try {
                const response = await fetch(`http://localhost:3000/api/election/pending-election/${id}`);
                const electionList = await response.json();
                console.log(electionList);
        
                const electionContainer = document.querySelector('#election-container'); // Target parent container
                electionContainer.innerHTML = ''; // Clear existing cards before rendering

                if (electionList.length === 0) {
                    // Display no requests available if list is empty
                    const colDiv = document.createElement('div');
                    colDiv.className = 'col-12'; // Take full width if no elections available
                    colDiv.innerHTML = `
                        <div class="election-duty-card text-center">
                            <p class="text-muted p-3">No Requests available!</p>
                        </div>
                    `;
                    electionContainer.appendChild(colDiv);
                    return; // Exit function if no elections
                }
        
                // Loop through each election and create a card inside col-md-6 col-lg-4 mb-4
                electionList.forEach(election => {
                    // Create outer div
                    const colDiv = document.createElement('div');
                    colDiv.className = 'col-md-6 col-lg-4 mb-4';
        
                    // Create the card HTML inside colDiv
                    if(electionList.length>0){
                        colDiv.innerHTML = `
                        <div class="election-duty-card">
                            <div class="election-duty-header">
                                <h5 class="election-duty-title">${election.electionName}</h5>
                            </div>
                            <div class="election-duty-body">
                                <div class="election-duty-info">
                                    <div class="election-duty-label">
                                        <i class="fas fa-calendar-alt"></i> Election Start Time
                                    </div>
                                    <div class="election-duty-value">${formatDateTime(election.electionFrom)}</div>
                                </div>
                                <div class="election-duty-info">
                                    <div class="election-duty-label">
                                        <i class="fas fa-clock"></i> Election Duration
                                    </div>
                                    <div class="election-duty-value">${calculateDuration(election.electionFrom, election.electionTo)}</div>
                                </div>
                                <div class="election-duty-info">
                                    <div class="election-duty-label">
                                        <i class="fas fa-map-marker-alt"></i> Election Venue
                                    </div>
                                    <div class="election-duty-value">${election.electionVenue}</div>
                                </div>
                            </div>
                            <div class="election-duty-footer">
                                <button class="election-duty-btn accept" onclick="acceptElectionDuty('${election._id}', 'accept_duty','${election.electionName}')">
                                    Accept
                                </button>
                                <button class="election-duty-btn reject" onclick="rejectElectionDuty('${election._id}', 'reject_duty','${election.electionName}')">
                                    Decline
                                </button>
                            </div>
                        </div>
                    `;
                    }
        
                    // Append the colDiv to the electionContainer
                    electionContainer.appendChild(colDiv);
                });
            } catch (error) {
                console.error('Error fetching election list:', error);
            }
        }
        
        // Format DateTime Helper
        function formatDateTime(dateTime) {
            const date = new Date(dateTime);
            return date.toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
        }
        
        // Calculate Duration Helper
        function calculateDuration(start, end) {
            const startTime = new Date(start);
            const endTime = new Date(end);
            const durationInMs = endTime - startTime;
            const durationInHours = Math.floor(durationInMs / (1000 * 60 * 60));
            return `${durationInHours} Hours`;
        }



        async function fetchNominations() {
            const batchId = localStorage.getItem('batchRef');
            
            try {
                const response = await fetch(`http://localhost:3000/api/nomination/get-nomination/${batchId}`);
                const nominations = await response.json();
                const nominationTableBody = document.querySelector('.nomination-table tbody');
        
                // Clear existing rows
                nominationTableBody.innerHTML = '';
                if (nominations.length === 0) {
                    nominationTableBody.innerHTML = `
                        <tr>
                            <td colspan="4" style="text-align: center;">No nominations found for this batch.</td>
                        </tr>
                    `;
                    return;
                }
        
                nominations.forEach(nomination => {
                    const row = document.createElement('tr');
        
                    row.innerHTML = `
                        <td>${nomination.nomineeName.userFullName}</td>
                        <td>${nomination.nomineeName.batchRef.batchName || 'N/A'}</td>
                        <td>${nomination.nomineeName.studentAdmissionNumber || 'N/A'}</td>
                        <td>${nomination.nominatedRole || 'N/A'}</td>
                        <td>${nomination.nomineeStatement || 'N/A'}</td>
                        <td>${nomination.backlogNumber || '0'}</td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action approve" onclick="approveNomination('${nomination._id}', '${nomination.nomineeName.userFullName}', '${nomination.nomineeName._id}','${nomination.nomineeElection}')">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="table-action reject" onclick="rejectNomination('${nomination._id}', '${nomination.nomineeName.userFullName}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </td>
                    `;
        
                    nominationTableBody.appendChild(row);
                });
        
            } catch (err) {
                console.error('Error fetching nominations:', err.message);
            }
        }


        async function fetchAllNominations(batchId) {
            try {
                const response = await fetch(`http://localhost:3000/api/nomination/all-nomination/${batchId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch nominations');
                }
    
                const nominations = await response.json();
                populateNominationsTable(nominations);
            } catch (error) {
                console.error('Error fetching nominations:', error.message);
            }
        }
    
        // Function to populate nominations dynamically
        function populateNominationsTable(nominations) {
            const tableBody = document.querySelector(".all-nomination-list tbody");
            tableBody.innerHTML = ""; // Clear existing rows
    
            if (nominations.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center;">No nominations found!</td>
                    </tr>`;
                return;
            }
    
            // Loop through each nomination and create a row
            nominations.forEach((nomination) => {
                const statusBadge = nomination.nominationStatus
                    ? `<span class="status-badge status-approved">Approved</span>`
                    : `<span class="status-badge status-rejected">Rejected</span>`;
    
                const row = `
                    <tr>
                        <td>${nomination.nomineeName?.userFullName || "N/A"}</td>
                        <td>${nomination.nomineeName?.batchRef?.batchName || "N/A"}</td>
                        <td>${nomination.nomineeName?.studentAdmissionNumber || "N/A"}</td>
                        <td>${statusBadge}</td>
                        <td>${nomination.nomineeRejectReason || '-'}</td>
                        <td>${formatDateTime(nomination.updatedAt)}</td>
                    </tr>`;
                tableBody.innerHTML += row;
            });
        }

        async function startElection(electionId) {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: "Once started, voting will be completed after the configured duration.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#28a745",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Start Election",
            });
        
            if (confirmation.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/election/start-election/${electionId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                    });
        
                    const data = await response.json();
        
                    if (response.ok) {
                        showToast(data.message, "success");
                        setTimeout(() => location.reload(), 1000); // Refresh the page after success
                    } else {
                        showToast(data.message || "Error starting election", "danger");
                    }
                } catch (err) {
                    console.error(err);
                    showToast("An error occurred while starting the election.", "danger");
                }
            }
        }
        

        async function terminateElection(electionId) {
            const confirmation = await Swal.fire({
                title: "Are you sure?",
                text: "Once Terminated, voting will be ended!",
                icon: "error",
                showCancelButton: true,
                confirmButtonColor: "#28a745",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Terminate Election",
            });
        
            if (confirmation.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/election/terminate-election/${electionId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                    });
        
                    const data = await response.json();
        
                    if (response.ok) {
                        showToast(data.message, "success");
                    } else {
                        showToast(data.message || "Error starting election", "danger");
                    }
                } catch (err) {
                    console.error(err);
                    showToast("An error occurred while starting the election.", "danger");
                }
            }
        }
        
        




    
        
        
        
    
    
    
    
    