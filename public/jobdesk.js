// =====================================================
// JOB DESK - APPLICATION TRACKER
// =====================================================


// =====================================================
// DOM ELEMENTS
// =====================================================

const addApplicationBtn =
    document.getElementById("addApplicationBtn");

const tableViewBtn =
    document.getElementById("tableViewBtn");

const kanbanViewBtn =
    document.getElementById("kanbanViewBtn");

const spreadsheetView =
    document.getElementById("spreadsheetView");

const kanbanView =
    document.getElementById("kanbanView");

const applicationTableBody =
    document.getElementById("applicationTableBody");

const emptyState =
    document.getElementById("emptyState");


// =====================================================
// STORAGE
// =====================================================

const STORAGE_KEY = "hirelens_job_applications";

let applications =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];


// =====================================================
// SAVE TO LOCAL STORAGE
// =====================================================

function saveApplications() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(applications)
    );

}


// =====================================================
// GENERATE UNIQUE ID
// =====================================================

function generateId() {

    return (
        Date.now().toString() +
        Math.random().toString(36).substring(2, 8)
    );

}


// =====================================================
// TODAY'S DATE
// =====================================================

function getTodayDate() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// =====================================================
// ADD NEW APPLICATION
// =====================================================

addApplicationBtn.addEventListener(
    "click",
    () => {

        const newApplication = {

            id: generateId(),

            company: "",

            role: "",

            referral: "",

            dateApplied: getTodayDate(),

            status: "Applied",

            notes: ""

        };


        applications.push(
            newApplication
        );

        saveApplications();

        renderApplications();


        // Focus first input of new row

        setTimeout(() => {

            const input =
                document.querySelector(
                    `[data-id="${newApplication.id}"][data-field="company"]`
                );

            if (input) {
                input.focus();
            }

        }, 50);

    }
);


// =====================================================
// RENDER SPREADSHEET
// =====================================================

function renderApplications() {

    applicationTableBody.innerHTML = "";


    // No applications

    if (applications.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }


    applications.forEach(application => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <input
                    type="text"
                    placeholder="Company name"
                    value="${escapeHTML(application.company)}"
                    data-id="${application.id}"
                    data-field="company"
                >

            </td>


            <td>

                <input
                    type="text"
                    placeholder="Role"
                    value="${escapeHTML(application.role)}"
                    data-id="${application.id}"
                    data-field="role"
                >

            </td>


            <td>

                <input
                    type="text"
                    placeholder="Name / Yes / No"
                    value="${escapeHTML(application.referral)}"
                    data-id="${application.id}"
                    data-field="referral"
                >

            </td>


            <td>

                <input
                    type="date"
                    value="${escapeHTML(application.dateApplied)}"
                    data-id="${application.id}"
                    data-field="dateApplied"
                >

            </td>


            <td>

                <select
                    data-id="${application.id}"
                    data-field="status"
                >

                    <option
                        value="Applied"
                        ${application.status === "Applied" ? "selected" : ""}
                    >
                        Applied
                    </option>

                    <option
                        value="OA / Assessment"
                        ${application.status === "OA / Assessment" ? "selected" : ""}
                    >
                        OA / Assessment
                    </option>

                    <option
                        value="Interviewing"
                        ${application.status === "Interviewing" ? "selected" : ""}
                    >
                        Interviewing
                    </option>

                    <option
                        value="Offer"
                        ${application.status === "Offer" ? "selected" : ""}
                    >
                        Offer
                    </option>

                    <option
                        value="Rejected"
                        ${application.status === "Rejected" ? "selected" : ""}
                    >
                        Rejected
                    </option>

                </select>

            </td>


            <td>

                <textarea
                    placeholder="Add notes..."
                    data-id="${application.id}"
                    data-field="notes"
                >${escapeHTML(application.notes)}</textarea>

            </td>


            <td>

                <button
                    class="delete-btn"
                    data-delete-id="${application.id}"
                    title="Delete application"
                >
                    🗑
                </button>

            </td>

        `;


        applicationTableBody.appendChild(row);

    });


    renderKanban();

}


// =====================================================
// UPDATE APPLICATION
// =====================================================

applicationTableBody.addEventListener(
    "input",
    event => {

        const target =
            event.target;

        const id =
            target.dataset.id;

        const field =
            target.dataset.field;


        if (!id || !field) {
            return;
        }


        const application =
            applications.find(
                item => item.id === id
            );


        if (!application) {
            return;
        }


        application[field] =
            target.value;


        saveApplications();

        renderKanban();

    }
);


// =====================================================
// HANDLE SELECT CHANGE
// =====================================================

applicationTableBody.addEventListener(
    "change",
    event => {

        const target =
            event.target;

        const id =
            target.dataset.id;

        const field =
            target.dataset.field;


        if (!id || !field) {
            return;
        }


        const application =
            applications.find(
                item => item.id === id
            );


        if (!application) {
            return;
        }


        application[field] =
            target.value;


        saveApplications();

        renderApplications();

    }
);


// =====================================================
// DELETE APPLICATION
// =====================================================

applicationTableBody.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-delete-id]"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.deleteId;


        const application =
            applications.find(
                item => item.id === id
            );


        if (!application) {
            return;
        }


        const companyName =
            application.company ||
            "this application";


        const confirmed =
            confirm(
                `Delete ${companyName}?`
            );


        if (!confirmed) {
            return;
        }


        applications =
            applications.filter(
                item => item.id !== id
            );


        saveApplications();

        renderApplications();

    }
);


// =====================================================
// SPREADSHEET / KANBAN TOGGLE
// =====================================================

tableViewBtn.addEventListener(
    "click",
    () => {

        spreadsheetView.style.display =
            "block";

        kanbanView.style.display =
            "none";


        tableViewBtn.classList.add(
            "active"
        );

        kanbanViewBtn.classList.remove(
            "active"
        );

    }
);


kanbanViewBtn.addEventListener(
    "click",
    () => {

        spreadsheetView.style.display =
            "none";

        kanbanView.style.display =
            "block";


        kanbanViewBtn.classList.add(
            "active"
        );

        tableViewBtn.classList.remove(
            "active"
        );


        renderKanban();

    }
);


// =====================================================
// RENDER KANBAN BOARD
// =====================================================

function renderKanban() {

    const columns = {

        "Applied":
            document.getElementById(
                "kanbanApplied"
            ),

        "OA / Assessment":
            document.getElementById(
                "kanbanOA"
            ),

        "Interviewing":
            document.getElementById(
                "kanbanInterviewing"
            ),

        "Offer":
            document.getElementById(
                "kanbanOffer"
            ),

        "Rejected":
            document.getElementById(
                "kanbanRejected"
            )

    };


    // Clear columns

    Object.values(columns).forEach(
        column => {
            column.innerHTML = "";
        }
    );


    // Add applications to columns

    applications.forEach(application => {

        const column =
            columns[application.status];


        if (!column) {
            return;
        }


        const card =
            document.createElement("div");


        card.className =
            "kanban-card";

        card.draggable = true;

        card.dataset.id =
            application.id;


        card.innerHTML = `

            <h4>
                ${escapeHTML(
                    application.company ||
                    "Unnamed Company"
                )}
            </h4>


            <p>
                ${
                    escapeHTML(
                        application.role ||
                        "Role not added"
                    )
                }
            </p>


            ${
                application.referral
                    ? `
                        <p>
                            🤝 Referral:
                            ${escapeHTML(
                                application.referral
                            )}
                        </p>
                    `
                    : ""
            }


            <p class="kanban-date">

                Applied:
                ${
                    application.dateApplied
                        ? formatDate(
                            application.dateApplied
                        )
                        : "Not specified"
                }

            </p>

        `;


        // Drag start

        card.addEventListener(
            "dragstart",
            handleDragStart
        );


        card.addEventListener(
            "dragend",
            handleDragEnd
        );


        column.appendChild(card);

    });


    // Update counters

    updateKanbanCounts();

}


// =====================================================
// KANBAN COUNTERS
// =====================================================

function updateKanbanCounts() {

    const counts = {

        Applied: 0,

        "OA / Assessment": 0,

        Interviewing: 0,

        Offer: 0,

        Rejected: 0

    };


    applications.forEach(
        application => {

            if (
                counts[
                    application.status
                ] !== undefined
            ) {

                counts[
                    application.status
                ]++;

            }

        }
    );


    document.getElementById(
        "countApplied"
    ).textContent =
        counts.Applied;


    document.getElementById(
        "countOA"
    ).textContent =
        counts["OA / Assessment"];


    document.getElementById(
        "countInterviewing"
    ).textContent =
        counts.Interviewing;


    document.getElementById(
        "countOffer"
    ).textContent =
        counts.Offer;


    document.getElementById(
        "countRejected"
    ).textContent =
        counts.Rejected;

}


// =====================================================
// DRAG START
// =====================================================

function handleDragStart(event) {

    event.dataTransfer.setData(
        "text/plain",
        event.currentTarget.dataset.id
    );

    event.currentTarget.classList.add(
        "dragging"
    );

}


// =====================================================
// DRAG END
// =====================================================

function handleDragEnd(event) {

    event.currentTarget.classList.remove(
        "dragging"
    );

}


// =====================================================
// KANBAN DROP
// =====================================================

document.querySelectorAll(
    ".kanban-cards"
).forEach(column => {

    column.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

        }
    );


    column.addEventListener(
        "drop",
        event => {

            event.preventDefault();


            const id =
                event.dataTransfer.getData(
                    "text/plain"
                );


            const newStatus =
                column
                    .closest(
                        ".kanban-column"
                    )
                    .dataset.status;


            const application =
                applications.find(
                    item => item.id === id
                );


            if (!application) {
                return;
            }


            application.status =
                newStatus;


            saveApplications();

            renderApplications();

        }
    );

});


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// INITIAL LOAD
// =====================================================

renderApplications();


// =====================================================
// JOB DESK - COMPANY FINDER
// =====================================================

const findCompaniesBtn =
    document.getElementById("findCompaniesBtn");

const jobRoleInput =
    document.getElementById("jobRole");

const universityInput =
    document.getElementById("university");

const hiringLoading =
    document.getElementById("hiringLoading");

const companyResults =
    document.getElementById("companyResults");


// =====================================================
// FIND COMPANIES
// =====================================================

findCompaniesBtn.addEventListener(
    "click",
    async () => {

        const role =
            jobRoleInput.value.trim();

        const university =
            universityInput.value.trim();


        // ---------------- VALIDATION ----------------

        if (!role) {

            alert(
                "Please enter the role you are looking for."
            );

            jobRoleInput.focus();

            return;

        }


        // ---------------- SHOW LOADING ----------------

        findCompaniesBtn.disabled = true;

        findCompaniesBtn.textContent =
            "Finding Companies...";

        hiringLoading.style.display =
            "block";

        companyResults.style.display =
            "none";


        try {

            // -----------------------------------------
            // CALL BACKEND
            // -----------------------------------------

            const response =
                await fetch(
                    "/api/jobdesk/companies",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            role: role,

                            university:
                                university

                        })

                    }
                );


            const data =
                await response.json();


            // -----------------------------------------
            // HANDLE ERROR
            // -----------------------------------------

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to find companies."
                );

            }


            // -----------------------------------------
            // DISPLAY RESULTS
            // -----------------------------------------

            renderCompanyResults(
                data,
                role,
                university
            );


        } catch (error) {

            console.error(
                "Company Finder Error:",
                error
            );

            alert(
                error.message ||
                "Unable to find companies. Please try again."
            );


        } finally {

            findCompaniesBtn.disabled =
                false;

            findCompaniesBtn.textContent =
                "Find Hiring Companies →";

            hiringLoading.style.display =
                "none";

        }

    }
);


// =====================================================
// RENDER ALL COMPANY RESULTS
// =====================================================

function renderCompanyResults(
    data,
    role,
    university
) {

    renderCompanyTier(
        data.top,
        "topCompanies",
        role,
        university
    );


    renderCompanyTier(
        data.mid,
        "midCompanies",
        role,
        university
    );


    renderCompanyTier(
        data.small,
        "smallCompanies",
        role,
        university
    );


    renderCompanyTier(
        data.startups,
        "startupCompanies",
        role,
        university
    );


    companyResults.style.display =
        "block";


    companyResults.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =====================================================
// RENDER ONE COMPANY CATEGORY
// =====================================================

function renderCompanyTier(
    companies,
    containerId,
    role,
    university
) {

    const container =
        document.getElementById(containerId);


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !Array.isArray(companies) ||
        companies.length === 0
    ) {

        container.innerHTML = `
            <p>
                No companies found for this category.
            </p>
        `;

        return;

    }


    companies.forEach(company => {

        const companyName =
            company.name ||
            "Company";


        const companyRole =
            company.role ||
            role;


        const companyReason =
            company.reason ||
            "Relevant to this career path.";


        const careersUrl =
            isValidHttpUrl(
                company.careers_url
            )
                ? company.careers_url
                : "#";


        // ---------------------------------------------
        // CREATE LINKEDIN SEARCH
        // ---------------------------------------------

        const linkedinQuery =
            `${companyName} ${companyRole} ${university}`;


        const linkedinUrl =
            `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                linkedinQuery
            )}`;


        // ---------------------------------------------
        // CREATE CARD
        // ---------------------------------------------

        const card =
            document.createElement("div");


        card.className =
            "company-card";


        card.innerHTML = `

            <h4>
                ${escapeHTML(companyName)}
            </h4>


            <p class="company-role">
                ${escapeHTML(companyRole)}
            </p>


            <p class="company-reason">
                ${escapeHTML(companyReason)}
            </p>


            <div class="company-actions">

                ${
                    careersUrl !== "#"
                        ? `
                            <a
                                href="${escapeAttribute(careersUrl)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="careers-link"
                            >
                                Official Careers ↗
                            </a>
                        `
                        : `
                            <span
                                class="careers-link"
                                title="Careers page not provided by AI"
                            >
                                Careers Page Unavailable
                            </span>
                        `
                }


                <a
                    href="${escapeAttribute(linkedinUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="linkedin-link"
                >
                    Find Alumni / Engineers ↗
                </a>

            </div>

        `;


        container.appendChild(card);

    });

}


// =====================================================
// CHECK URL
// =====================================================

function isValidHttpUrl(value) {

    if (
        !value ||
        typeof value !== "string"
    ) {

        return false;

    }


    try {

        const url =
            new URL(value);


        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {

        return false;

    }

}


// =====================================================
// HTML SECURITY HELPERS
// =====================================================

function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


// =====================================================
// EMAIL & REFERRAL TEMPLATES
// =====================================================

const templateEditor =
    document.getElementById("templateEditor");

const templateText =
    document.getElementById("templateText");

const closeEditorBtn =
    document.getElementById("closeEditorBtn");

const copyTemplateBtn =
    document.getElementById("copyTemplateBtn");

const templateButtons =
    document.querySelectorAll(
        ".secondary-btn[data-template]"
    );


// =====================================================
// TEMPLATE CONTENT
// =====================================================

const templates = {

    referral: `
Hi [Name],

I hope you're doing well. I came across your profile and noticed that you work at [Company]. I am a student at [University] currently looking for opportunities as a [Role].

I have been building my skills in [Skills] and recently came across the [Job Title / Job ID] opportunity at [Company]. If you feel my profile is relevant, I would be grateful if you could consider referring me for the role.

Thank you for your time and consideration.

Best regards,
[Your Name]
`,

    recruiter: `
Hi [Recruiter Name],

I hope you're doing well. I recently applied for the [Role] position at [Company] and wanted to briefly follow up regarding my application.

I am particularly interested in this opportunity because of my experience with [Relevant Skills / Technologies]. I would be grateful for any update you can share regarding the application process.

Thank you for your time.

Best regards,
[Your Name]
`,

    alumni: `
Hi [Name],

I hope you're doing well. I am a student at [University] and noticed that you are currently working at [Company] as a [Role].

I am interested in opportunities in [Target Role / Field] and would really appreciate hearing about your experience at [Company]. I am currently preparing for placements and building projects in [Skills].

Thank you for connecting, and I appreciate your time.

Best regards,
[Your Name]
`

};


// =====================================================
// OPEN TEMPLATE
// =====================================================

templateButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const templateType =
                button.dataset.template;


            if (
                !templates[templateType]
            ) {
                return;
            }


            templateText.value =
                templates[templateType];


            templateEditor.style.display =
                "block";


            templateEditor.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            templateText.focus();

        }
    );

});


// =====================================================
// CLOSE TEMPLATE EDITOR
// =====================================================

closeEditorBtn.addEventListener(
    "click",
    () => {

        templateEditor.style.display =
            "none";

    }
);


// =====================================================
// COPY TEMPLATE
// =====================================================

copyTemplateBtn.addEventListener(
    "click",
    async () => {

        const message =
            templateText.value.trim();


        if (!message) {

            alert(
                "There is no message to copy."
            );

            return;

        }


        try {

            await navigator.clipboard.writeText(
                message
            );


            const originalText =
                copyTemplateBtn.textContent;


            copyTemplateBtn.textContent =
                "✓ Copied!";


            setTimeout(() => {

                copyTemplateBtn.textContent =
                    originalText;

            }, 1800);


        } catch (error) {

            // Fallback for browsers where
            // Clipboard API is unavailable

            templateText.select();

            document.execCommand(
                "copy"
            );


            copyTemplateBtn.textContent =
                "✓ Copied!";


            setTimeout(() => {

                copyTemplateBtn.textContent =
                    "Copy Message";

            }, 1800);

        }

    }
);