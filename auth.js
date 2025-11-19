document.addEventListener('DOMContentLoaded', () => {
    const USERS_STORAGE_KEY = 'klu-marketplace-users';
    const CURRENT_USER_KEY = 'klu-marketplace-current-user';

    // Expose API base URL globally so other pages (like profile.html) can reuse it
    window.API_BASE = 'http://localhost:8080/api';

    function loadUsers() {
        // Kept only for backward compatibility; not used with backend auth.
        try {
            return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function setCurrentUser(user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || ''
        }));
    }

    function findUserByEmail(email) {
        const users = loadUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function redirectAfterAuth() {
        const redirect = getQueryParam('redirect');
        if (redirect) {
            window.location.href = redirect;
        } else {
            window.location.href = 'index.html';
        }
    }

    // Make a simple helper available globally for other scripts (e.g., script.js)
    window.kluAuth = {
        isLoggedIn: () => {
            return !!localStorage.getItem(CURRENT_USER_KEY);
        },
        getCurrentUser: () => {
            try {
                return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
            } catch {
                return null;
            }
        },
        logout: () => {
            console.log('Logging out...');
            // Clear localStorage
            localStorage.removeItem(CURRENT_USER_KEY);
            localStorage.removeItem('klu-marketplace-cart');
            console.log('localStorage cleared');
            // Redirect to logout page
            console.log('Redirecting to logout.html');
            window.location.href = 'logout.html';
        }
    };
    
    // Make handleLogout globally available
    window.handleLogout = function() {
        console.log('handleLogout called');
        if (confirm('Are you sure you want to logout?')) {
            console.log('User confirmed logout');
            window.kluAuth.logout();
        } else {
            console.log('User cancelled logout');
        }
    };

    // Update navbar account display if present
    const accountSlot = document.getElementById('nav-account');
    if (accountSlot) {
        const currentUser = window.kluAuth.getCurrentUser();
        if (currentUser?.firstName) {
            const initials = (currentUser.firstName[0] || '').toUpperCase();
            accountSlot.innerHTML = `
                <div class="nav-account-pill">
                    <div class="nav-avatar">${initials}</div>
                    <span class="nav-account-name">${currentUser.firstName}</span>
                </div>
            `;
        } else {
            // User not logged in - show default account icon/text
            // Only update if it's empty or doesn't have the fallback content
            if (!accountSlot.querySelector('.nav-avatar') && !accountSlot.querySelector('.nav-account-text')) {
                accountSlot.innerHTML = `
                    <span class="nav-avatar">👤</span>
                    <span class="nav-account-text">Account</span>
                `;
            }
        }
    }

    // LOGIN HANDLING
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const emailError = document.getElementById('email-error');
            const passwordError = document.getElementById('password-error');

            if (emailError) emailError.textContent = '';
            if (passwordError) passwordError.textContent = '';

            const email = emailInput?.value.trim() || '';
            const password = passwordInput?.value || '';

            if (!email || !password) {
                if (!email && emailError) emailError.textContent = 'Email is required';
                if (!password && passwordError) passwordError.textContent = 'Password is required';
                return;
            }

            fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
                .then(async (response) => {
                    const data = await response.json().catch(() => ({}));
                    if (response.status === 404) {
                        alert('No account found with this email. Please sign up first.');
                        const signupUrl = new URL('signup.html', window.location.href);
                        signupUrl.searchParams.set('email', email);
                        const redirect = getQueryParam('redirect');
                        if (redirect) {
                            signupUrl.searchParams.set('redirect', redirect);
                        }
                        window.location.href = signupUrl.toString();
                        return;
                    }
                    if (!response.ok) {
                        if (passwordError && data.message) {
                            passwordError.textContent = data.message;
                        } else {
                            alert(data.message || 'Login failed');
                        }
                        return;
                    }

                    const user = {
                        email: data.email || email,
                        firstName: data.firstName || '',
                        lastName: data.lastName || ''
                    };
                    setCurrentUser(user);
                    redirectAfterAuth();
                })
                .catch(() => {
                    alert('Unable to reach the server. Please try again later.');
                });
        });
    }

    // SIGNUP HANDLING
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        // Pre-fill email from query param if present
        const emailFromQuery = getQueryParam('email');
        if (emailFromQuery) {
            const emailInput = document.getElementById('email');
            if (emailInput && !emailInput.value) {
                emailInput.value = emailFromQuery;
            }
        }

        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const firstNameInput = document.getElementById('firstname');
            const lastNameInput = document.getElementById('lastname');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            const phoneInput = document.getElementById('phone');
            const branchInput = document.getElementById('branch');

            const firstName = firstNameInput?.value.trim() || '';
            const lastName = lastNameInput?.value.trim() || '';
            const email = emailInput?.value.trim() || '';
            const password = passwordInput?.value || '';
            const confirmPassword = confirmPasswordInput?.value || '';
            const phone = phoneInput?.value.trim() || '';
            const branch = branchInput?.value || '';

            if (!firstName || !lastName || !email || !password || !confirmPassword || !phone || !branch) {
                alert('Please fill in all required fields.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    phone,
                    branch
                })
            })
                .then(async (response) => {
                    const data = await response.json().catch(() => ({}));
                    if (response.status === 409) {
                        alert('An account with this email already exists. Please log in instead.');
                        const loginUrl = new URL('login.html', window.location.href);
                        loginUrl.searchParams.set('email', email);
                        const redirect = getQueryParam('redirect');
                        if (redirect) {
                            loginUrl.searchParams.set('redirect', redirect);
                        }
                        window.location.href = loginUrl.toString();
                        return;
                    }
                    if (!response.ok) {
                        alert(data.message || 'Signup failed');
                        return;
                    }

                    setCurrentUser({ firstName, lastName, email });
                    alert('Account created successfully!');
                    redirectAfterAuth();
                })
                .catch(() => {
                    alert('Unable to reach the server. Please try again later.');
                });
        });
    }
});

// Basic helpers referenced in login.html for password toggle and social buttons
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function loginWithGoogle() {
    alert('Google login is not configured in this demo.');
}

function loginWithFacebook() {
    alert('Facebook login is not configured in this demo.');
}

function forgotPassword() {
    alert('Password reset is not configured in this demo. Please contact the admin.');
}



