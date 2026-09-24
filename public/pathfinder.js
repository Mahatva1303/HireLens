// =====================================================
// PATHFINDER JAVASCRIPT
// =====================================================


// ==================== GET ELEMENTS ====================

const form = document.getElementById("pathfinderForm");

const roleInput = document.getElementById("role");

const skillsInput = document.getElementById("skills");

const levelInputs =
    document.querySelectorAll('input[name="level"]');

const experienceInput =
    document.getElementById("experience");

const hoursInput =
    document.getElementById("hours");

const generateBtn =
    document.getElementById("generateBtn");

const btnText =
    document.getElementById("btnText");

const loadingSection =
    document.getElementById("loadingSection");

const resultsSection =
    document.getElementById("resultsSection");

const resultsContainer =
    document.getElementById("resultsContainer");


// =====================================================
// ROLE SUGGESTION BUTTONS
// =====================================================

const suggestionButtons =
    document.querySelectorAll(".suggestion");

suggestionButtons.forEach(button => {

    button.addEventListener("click", () => {

        const role =
            button.getAttribute("data-role");

        roleInput.value = role;

        roleInput.focus();

    });

});


// =====================================================
// FORM SUBMIT
// =====================================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();


    // Get current level

    let selectedLevel = "";

    levelInputs.forEach(input => {

        if (input.checked) {
            selectedLevel = input.value;
        }

    });


    // Get all form data

    const role =
        roleInput.value.trim();

    const level =
        selectedLevel;

    const skills =
        skillsInput.value.trim();

    const experience =
        experienceInput.value;

    const hours =
        hoursInput.value;


    // =================================================
    // VALIDATION
    // =================================================

    if (!role) {

        alert("Please enter the role you want to become.");

        roleInput.focus();

        return;

    }


    if (!level) {

        alert("Please select your current skill level.");

        return;

    }


    // =================================================
    // SHOW LOADING
    // =================================================

    generateBtn.disabled = true;

    btnText.textContent =
        "Generating Your Path...";

    loadingSection.style.display =
        "block";

    resultsSection.style.display =
        "none";


    // Scroll to loading section

    loadingSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    try {


        // =================================================
        // SEND DATA TO BACKEND
        // =================================================

        const response = await fetch(
            "/api/pathfinder",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    role: role,

                    level: level,

                    skills: skills,

                    experience: experience,

                    hours: hours

                })

            }
        );


        // =================================================
        // READ RESPONSE
        // =================================================

        const data =
            await response.json();


        // Backend error

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to generate career path."
            );

        }


        // =================================================
        // DISPLAY RESULT
        // =================================================

        displayResults(data);


    } catch (error) {

        console.error(
            "PathFinder Error:",
            error
        );


        alert(
            error.message ||
            "Something went wrong. Please try again."
        );


    } finally {

        // =================================================
        // RESET BUTTON
        // =================================================

        generateBtn.disabled = false;

        btnText.textContent =
            "Generate My Career Path →";

        loadingSection.style.display =
            "none";

    }

});


// =====================================================
// DISPLAY AI RESULTS
// =====================================================

function displayResults(data) {

    resultsContainer.innerHTML = `

        <!-- ================= SUMMARY ================= -->

        <div class="result-card">

            <h2>
                🎯 ${escapeHTML(data.role)}
            </h2>

            <p>
                Personalized career roadmap for
                <strong>
                    ${escapeHTML(data.current_level)}
                </strong>
            </p>

            <h3>
                ⏱️ Estimated Time
            </h3>

            <p>
                ${escapeHTML(data.estimated_time)}
            </p>

        </div>


        <!-- ================= ROADMAP ================= -->

        <div class="result-card">

            <h2>
                🗺️ Your Personalized Roadmap
            </h2>

            <div class="timeline">

                ${
                    Array.isArray(data.roadmap)

                        ? data.roadmap.map(
                            (item, index) => `

                            <div class="timeline-item">

                                <h3>
                                    Phase ${index + 1}:
                                    ${escapeHTML(item.phase)}
                                </h3>

                                <p>
                                    <strong>
                                        Duration:
                                    </strong>
                                    ${escapeHTML(item.duration)}
                                </p>

                                <p>
                                    ${escapeHTML(item.description)}
                                </p>

                                <p>
                                    <strong>
                                        Skills:
                                    </strong>
                                    ${
                                        Array.isArray(item.skills)
                                            ? item.skills
                                                .map(skill =>
                                                    escapeHTML(skill)
                                                )
                                                .join(", ")
                                            : ""
                                    }
                                </p>

                            </div>

                        `
                        ).join("")

                        : "<p>No roadmap available.</p>"
                }

            </div>

        </div>


        <!-- ================= COMPANIES ================= -->

        <div class="result-card">

            <h2>
                🏢 Top Companies
            </h2>

            <div class="company-list">

                ${
                    Array.isArray(data.top_companies)

                        ? data.top_companies.map(
                            company => `

                            <div class="info-item">

                                <strong>
                                    ${escapeHTML(company.name)}
                                </strong>

                                <p>
                                    ${escapeHTML(company.reason)}
                                </p>

                            </div>

                        `
                        ).join("")

                        : "<p>No company information available.</p>"
                }

            </div>

        </div>


        <!-- ================= RESOURCES ================= -->

        <div class="result-card">

            <h2>
                📚 Learning Resources
            </h2>

            <div class="resource-list">

                ${
                    Array.isArray(data.learning_resources)

                        ? data.learning_resources.map(
                            resource => `

                            <div class="info-item">

                                <strong>
                                    ${escapeHTML(resource.name)}
                                </strong>

                                <p>
                                    ${escapeHTML(resource.type)}
                                </p>

                            </div>

                        `
                        ).join("")

                        : "<p>No resources available.</p>"
                }

            </div>

        </div>


        <!-- ================= CERTIFICATIONS ================= -->

        <div class="result-card">

            <h2>
                🎓 Recommended Certifications
            </h2>

            <ul>

                ${
                    Array.isArray(data.certifications)

                        ? data.certifications.map(
                            certification => `

                            <li>
                                ${escapeHTML(certification)}
                            </li>

                        `
                        ).join("")

                        : "<li>No certifications available.</li>"
                }

            </ul>

        </div>


        <!-- ================= PROJECTS ================= -->

        <div class="result-card">

            <h2>
                💼 Portfolio Projects
            </h2>

            <div class="project-list">

                ${
                    Array.isArray(data.projects)

                        ? data.projects.map(
                            project => `

                            <div class="info-item">

                                <strong>
                                    ${escapeHTML(project.title)}
                                </strong>

                                <p>
                                    ${escapeHTML(project.description)}
                                </p>

                                <p>
                                    <strong>
                                        Technologies:
                                    </strong>

                                    ${
                                        Array.isArray(
                                            project.technologies
                                        )

                                        ? project.technologies
                                            .map(tech =>
                                                escapeHTML(tech)
                                            )
                                            .join(", ")

                                        : ""
                                    }

                                </p>

                            </div>

                        `
                        ).join("")

                        : "<p>No project ideas available.</p>"
                }

            </div>

        </div>


        <!-- ================= ATS ================= -->

        <div class="result-card">

            <h2>
                📝 Resume & ATS Cheat Sheet
            </h2>

            <p>
                Important keywords for this role:
            </p>

            <div class="keywords">

                ${
                    Array.isArray(data.ats_keywords)

                        ? data.ats_keywords.map(
                            keyword => `

                            <span class="keyword">
                                ${escapeHTML(keyword)}
                            </span>

                        `
                        ).join("")

                        : "<p>No keywords available.</p>"
                }

            </div>

        </div>


        <!-- ================= SALARY ================= -->

        <div class="result-card">

            <h2>
                💰 Salary & Market Demand
            </h2>

            <h3>
                Entry-Level Salary
            </h3>

            <p>
                ${escapeHTML(data.salary)}
            </p>

            <h3>
                Market Demand
            </h3>

            <p>
                ${escapeHTML(data.market_demand)}
            </p>

        </div>


        <!-- ================= AGAIN BUTTON ================= -->

        <div class="result-card">

            <button
                class="generate-btn"
                onclick="generateAgain()"
            >
                ← Generate Another Path
            </button>

        </div>

    `;


    // =================================================
    // SHOW RESULTS
    // =================================================

    resultsSection.style.display =
        "block";


    // Scroll to results

    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =====================================================
// GENERATE AGAIN
// =====================================================

function generateAgain() {

    resultsSection.style.display =
        "none";

    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =====================================================
// SECURITY HELPER
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}