console.log("RentEast script loaded!");
const API = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", function () {

    setCurrentMonth();

    loadDashboard();
    loadRooms();
    loadTenants();
    loadPayments();
    loadUnpaidTenants();

    setupTenantForm();
    setupPaymentForm();
    setupVacateForm();
});


/* ================= DASHBOARD ================= */

async function loadDashboard() {

    try {

        const roomsResponse = await fetch(API + "/rooms");
        const rooms = await roomsResponse.json();

        const tenantsResponse = await fetch(API + "/tenants");
        const tenants = await tenantsResponse.json();

        const occupiedRooms =
            rooms.filter(room => room.occupied).length;

        const availableRooms =
            rooms.filter(room => !room.occupied).length;

        const activeTenants =
            tenants.filter(tenant => tenant.active).length;

        document.getElementById("totalRooms").textContent =
            rooms.length;

        document.getElementById("occupiedRooms").textContent =
            occupiedRooms;

        document.getElementById("availableRooms").textContent =
            availableRooms;

        document.getElementById("activeTenants").textContent =
            activeTenants;

    } catch (error) {

        console.error("Dashboard error:", error);

    }
}


/* ================= ROOMS ================= */

async function loadRooms() {

    try {

        const response = await fetch(API + "/rooms");
        const rooms = await response.json();

        if (rooms.length === 0) {

            document.getElementById("roomsList").innerHTML =
                "<p>No rooms available.</p>";

            return;
        }

        let html = `
            <table>
                <tr>
                    <th>ID</th>
                    <th>Room Number</th>
                    <th>Rent</th>
                    <th>Status</th>
                </tr>
        `;

        rooms.forEach(room => {

            html += `
                <tr>
                    <td>${room.id}</td>

                    <td>${room.roomNumber}</td>

                    <td>₹${room.rentAmount}</td>

                    <td class="${room.occupied ? 'occupied' : 'available'}">
                        ${room.occupied ? 'Occupied' : 'Available'}
                    </td>
                </tr>
            `;

        });

        html += `</table>`;

        document.getElementById("roomsList").innerHTML = html;

    } catch (error) {

        console.error("Rooms error:", error);

        document.getElementById("roomsList").innerHTML =
            "<p>Unable to load rooms.</p>";
    }
}


/* ================= TENANTS ================= */

async function loadTenants() {

    try {

        const response = await fetch(API + "/tenants");
        const tenants = await response.json();

        if (tenants.length === 0) {

            document.getElementById("tenantsList").innerHTML =
                "<p>No tenants available.</p>";

            return;
        }

        let html = `
            <table>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Room</th>
                    <th>Move In</th>
                    <th>Status</th>
                </tr>
        `;

        tenants.forEach(tenant => {

            let roomDisplay = "-";

            if (tenant.active && tenant.room) {
                roomDisplay = tenant.room.roomNumber;
            }

            let statusDisplay =
                tenant.active
                    ? `<span class="status-active">Active</span>`
                    : `<span class="status-inactive">Vacated</span>`;

            html += `
                <tr>

                    <td>${tenant.id}</td>

                    <td>${tenant.name}</td>

                    <td>${tenant.phone}</td>

                    <td>${roomDisplay}</td>

                    <td>${tenant.moveInDate || "-"}</td>

                    <td>${statusDisplay}</td>

                </tr>
            `;

        });

        html += `</table>`;

        document.getElementById("tenantsList").innerHTML = html;

    } catch (error) {

        console.error("Tenants error:", error);

        document.getElementById("tenantsList").innerHTML =
            "<p>Unable to load tenants.</p>";
    }
}


/* ================= PAYMENTS ================= */

async function loadPayments() {

    try {

        const response = await fetch(API + "/payments");
        const payments = await response.json();

        if (payments.length === 0) {

            document.getElementById("paymentsList").innerHTML =
                "<p>No payments recorded.</p>";

            return;
        }

        let html = `
            <table>
                <tr>
                    <th>ID</th>
                    <th>Tenant</th>
                    <th>Amount</th>
                    <th>Month</th>
                    <th>Payment Date</th>
                </tr>
        `;

        payments.forEach(payment => {

            html += `
                <tr>

                    <td>${payment.id}</td>

                    <td>
                        ${payment.tenant
                ? payment.tenant.name
                : '-'}
                    </td>

                    <td>₹${payment.amount}</td>

                    <td>${payment.month}</td>

                    <td>${payment.paymentDate}</td>

                </tr>
            `;

        });

        html += `</table>`;

        document.getElementById("paymentsList").innerHTML = html;

    } catch (error) {

        console.error("Payments error:", error);

        document.getElementById("paymentsList").innerHTML =
            "<p>Unable to load payments.</p>";
    }
}


/* ================= CURRENT MONTH UNPAID ================= */

async function loadUnpaidTenants() {

    try {

        const response =
            await fetch(API + "/payments/unpaid/current-month");

        const tenants = await response.json();

        if (tenants.length === 0) {

            document.getElementById("duesList").innerHTML =
                "<p>No unpaid active tenants for current month.</p>";

            return;
        }

        let html = `
            <table>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Room</th>
                </tr>
        `;

        tenants.forEach(tenant => {

            html += `
                <tr>

                    <td>${tenant.id}</td>

                    <td>${tenant.name}</td>

                    <td>${tenant.phone}</td>

                    <td>
                        ${tenant.room
                ? tenant.room.roomNumber
                : '-'}
                    </td>

                </tr>
            `;

        });

        html += `</table>`;

        document.getElementById("duesList").innerHTML = html;

    } catch (error) {

        console.error("Unpaid tenants error:", error);

        document.getElementById("duesList").innerHTML =
            "<p>Unable to load unpaid tenants.</p>";
    }
}


/* ================= REGISTER TENANT ================= */

function setupTenantForm() {

    const form = document.getElementById("tenantForm");

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("tenantName").value.trim();

        const phone =
            document.getElementById("tenantPhone").value.trim();

        const roomId =
            document.getElementById("tenantRoomId").value;

        if (!name || !phone || !roomId) {

            showMessage("Please fill all tenant details.", "error");

            return;
        }

        try {

            const response = await fetch(
                API + "/tenants/register/" + roomId,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        phone: phone
                    })
                }
            );

            if (!response.ok) {

                const errorText = await response.text();

                throw new Error(
                    errorText || "Tenant registration failed"
                );
            }

            const tenant = await response.json();

            showMessage(
                "Tenant " + tenant.name +
                " registered successfully!",
                "success"
            );

            form.reset();

            await refreshAll();

        } catch (error) {

            console.error(error);

            showMessage(
                "Registration failed: " + error.message,
                "error"
            );
        }
    });
}


/* ================= RECORD PAYMENT ================= */

function setupPaymentForm() {

    const form = document.getElementById("paymentForm");

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const tenantId =
            document.getElementById("paymentTenantId").value;

        const amount =
            document.getElementById("paymentAmount").value;

        const month =
            document.getElementById("paymentMonth").value;

        if (!tenantId || !amount || !month) {

            showMessage(
                "Please fill all payment details.",
                "error"
            );

            return;
        }

        if (Number(amount) <= 0) {

            showMessage(
                "Payment amount must be greater than 0.",
                "error"
            );

            return;
        }

        try {

            const response = await fetch(
                API + "/payments/" + tenantId,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        amount: Number(amount),
                        month: month
                    })
                }
            );

            if (!response.ok) {

                const errorText = await response.text();

                throw new Error(
                    errorText || "Payment failed"
                );
            }

            await response.json();

            showMessage(
                "Rent payment recorded successfully!",
                "success"
            );

            form.reset();

            setCurrentMonth();

            await refreshAll();

        } catch (error) {

            console.error(error);

            showMessage(
                "Payment failed: " + error.message,
                "error"
            );
        }
    });
}


/* ================= VACATE TENANT ================= */

function setupVacateForm() {

    const form = document.getElementById("vacateForm");

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const tenantId =
            document.getElementById("vacateTenantId").value;

        if (!tenantId) {

            showMessage(
                "Please enter tenant ID.",
                "error"
            );

            return;
        }

        try {

            const response = await fetch(
                API + "/tenants/" + tenantId + "/vacate",
                {
                    method: "PUT"
                }
            );

            if (!response.ok) {

                const errorText = await response.text();

                throw new Error(
                    errorText || "Vacate operation failed"
                );
            }

            const tenant = await response.json();

            showMessage(
                tenant.name + " vacated successfully!",
                "success"
            );

            form.reset();

            await refreshAll();

        } catch (error) {

            console.error(error);

            showMessage(
                "Vacate failed: " + error.message,
                "error"
            );
        }
    });
}


/* ================= REFRESH ALL DATA ================= */

async function refreshAll() {

    await loadDashboard();
    await loadRooms();
    await loadTenants();
    await loadPayments();
    await loadUnpaidTenants();
}


/* ================= MESSAGE ================= */

function showMessage(message, type) {

    const messageBox =
        document.getElementById("message");

    messageBox.textContent = message;

    messageBox.style.display = "block";

    if (type === "success") {

        messageBox.style.backgroundColor = "#dcfce7";
        messageBox.style.color = "#166534";

    } else {

        messageBox.style.backgroundColor = "#fee2e2";
        messageBox.style.color = "#991b1b";
    }

    setTimeout(function () {

        messageBox.style.display = "none";

    }, 4000);
}


/* ================= SET CURRENT MONTH ================= */

function setCurrentMonth() {

    const monthInput =
        document.getElementById("paymentMonth");

    if (!monthInput) {
        return;
    }

    const today = new Date();

    const year = today.getFullYear();

    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    monthInput.value = year + "-" + month;
}


/* ================= SECTION MENU ================= */

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(".section");

    sections.forEach(section => {
        section.classList.add("hidden");
    });

    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.remove("hidden");


    }
}