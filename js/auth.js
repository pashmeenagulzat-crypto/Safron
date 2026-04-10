/**
 * Safron – auth.js
 * Handles login, signup, OTP verification, forgot/reset password
 */

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'login')          initLogin();
  if (page === 'signup')         initSignup();
  if (page === 'forgot')         initForgot();
  if (page === 'verify-otp')     initVerifyOTP();
  if (page === 'reset-password') initReset();
});

// ── Login ─────────────────────────────────────────────────────────────────
function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const mobile   = form.mobile.value.trim();
    const password = form.password.value;
    let ok = true;

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      showFieldError('mobileError', 'Enter a valid 10-digit mobile number');
      ok = false;
    }
    if (password.length < 6) {
      showFieldError('passwordError', 'Password must be at least 6 characters');
      ok = false;
    }
    if (!ok) return;

    const btn = form.querySelector('[type=submit]');
    setLoading(btn, true);

    try {
      const data = await api.post('api/auth.php?action=login', { mobile, password });
      if (data.success) {
        Auth.save(data.user);
        showToast('Welcome back, ' + data.user.name.split(' ')[0] + '!', 'success');
        setTimeout(() => {
          // Restrict to relative paths only – reject protocol-relative, encoded
          // slashes, and anything containing scheme indicators to prevent
          // open-redirect and XSS exploitation.
          const raw = new URLSearchParams(location.search).get('redirect') || '';
          const safe = /^\/[a-zA-Z0-9_\-./]*$/.test(raw) ? raw : '/';
          location.assign(safe);
        }, 800);
      } else {
        showAlert('loginAlert', data.message, 'error');
      }
    } catch (err) {
      showAlert('loginAlert', 'Network error. Please try again.', 'error');
    } finally {
      setLoading(btn, false, '🔓 Login');
    }
  });

  // Toggle password visibility
  document.getElementById('togglePassword')?.addEventListener('click', function () {
    const inp = document.getElementById('loginPassword');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    this.textContent = inp.type === 'password' ? '👁' : '🙈';
  });
}

// ── Signup ────────────────────────────────────────────────────────────────
function initSignup() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const name     = form.fullname.value.trim();
    const mobile   = form.mobile.value.trim();
    const password = form.password.value;
    const confirm  = form.confirmPassword.value;
    let ok = true;

    if (name.length < 2) {
      showFieldError('nameError', 'Enter your full name'); ok = false;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      showFieldError('mobileError', 'Enter a valid 10-digit mobile number'); ok = false;
    }
    if (password.length < 6) {
      showFieldError('passwordError', 'Password must be at least 6 characters'); ok = false;
    }
    if (password !== confirm) {
      showFieldError('confirmError', 'Passwords do not match'); ok = false;
    }
    if (!ok) return;

    const btn = form.querySelector('[type=submit]');
    setLoading(btn, true);

    try {
      const data = await api.post('api/auth.php?action=signup', {
        name, mobile, password, email: form.email?.value?.trim() || '',
      });
      if (data.success) {
        // Store mobile for OTP verification
        sessionStorage.setItem('otp_mobile', mobile);
        sessionStorage.setItem('otp_code', data.otp || ''); // demo only
        showToast('Account created! Verify your number.', 'success');
        setTimeout(() => location.href = 'verify-otp.html', 800);
      } else {
        showAlert('signupAlert', data.message, 'error');
      }
    } catch (err) {
      showAlert('signupAlert', 'Network error. Please try again.', 'error');
    } finally {
      setLoading(btn, false, '✅ Create Account');
    }
  });
}

// ── OTP Verification ─────────────────────────────────────────────────────
function initVerifyOTP() {
  const mobile = sessionStorage.getItem('otp_mobile');
  if (!mobile) { location.href = 'signup.html'; return; }

  document.getElementById('otpMobileDisplay')?.textContent && (
    document.getElementById('otpMobileDisplay').textContent = '+91 ' + mobile
  );

  // Show demo OTP if available
  const demoOtp = sessionStorage.getItem('otp_code');
  if (demoOtp) {
    const info = document.getElementById('demoOtpInfo');
    if (info) {
      info.textContent = `Demo OTP: ${demoOtp}`;
      info.style.display = 'block';
    }
  }

  // OTP input auto-advance
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', (e) => {
      const v = e.target.value.replace(/\D/g, '').slice(-1);
      e.target.value = v;
      if (v && i < inputs.length - 1) inputs[i + 1].focus();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
    });
    inp.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = e.clipboardData.getData('text').replace(/\D/g, '');
      paste.split('').forEach((c, idx) => {
        if (inputs[idx]) inputs[idx].value = c;
      });
      inputs[Math.min(paste.length, inputs.length - 1)].focus();
    });
  });

  document.getElementById('verifyOtpForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = Array.from(inputs).map(i => i.value).join('');
    if (otp.length < 6) { showToast('Enter 6-digit OTP', 'warning'); return; }

    const btn = e.target.querySelector('[type=submit]');
    setLoading(btn, true);

    try {
      const data = await api.post('api/auth.php?action=verify-otp', { mobile, otp });
      if (data.success) {
        Auth.save(data.user);
        sessionStorage.removeItem('otp_mobile');
        sessionStorage.removeItem('otp_code');
        showToast('Mobile verified! Welcome 🎉', 'success');
        setTimeout(() => location.href = 'index.html', 900);
      } else {
        showAlert('otpAlert', data.message, 'error');
      }
    } catch (err) {
      showAlert('otpAlert', 'Network error.', 'error');
    } finally {
      setLoading(btn, false, '✅ Verify');
    }
  });

  // Resend OTP
  document.getElementById('resendOtpBtn')?.addEventListener('click', async function () {
    this.disabled = true;
    let sec = 30;
    const orig = this.textContent;
    const timer = setInterval(() => {
      this.textContent = `Resend in ${sec--}s`;
      if (sec < 0) { clearInterval(timer); this.disabled = false; this.textContent = orig; }
    }, 1000);

    try {
      const data = await api.post('api/auth.php?action=send-otp', { mobile });
      if (data.success) {
        if (data.otp) {
          const info = document.getElementById('demoOtpInfo');
          if (info) { info.textContent = `New demo OTP: ${data.otp}`; info.style.display = 'block'; }
        }
        showToast('New OTP sent!', 'success');
      } else {
        showToast(data.message, 'error');
      }
    } catch {}
  });
}

// ── Forgot password ───────────────────────────────────────────────────────
function initForgot() {
  document.getElementById('forgotForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mobile = e.target.mobile.value.trim();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      showAlert('forgotAlert', 'Enter a valid 10-digit mobile number', 'error'); return;
    }
    const btn = e.target.querySelector('[type=submit]');
    setLoading(btn, true);
    try {
      const data = await api.post('api/auth.php?action=forgot-password', { mobile });
      if (data.success) {
        sessionStorage.setItem('otp_mobile', mobile);
        if (data.otp) sessionStorage.setItem('reset_otp', data.otp);
        showAlert('forgotAlert', 'OTP sent! Redirecting…', 'success');
        setTimeout(() => location.href = 'reset-password.html', 1200);
      } else {
        showAlert('forgotAlert', data.message, 'error');
      }
    } catch { showAlert('forgotAlert', 'Network error.', 'error'); }
    finally { setLoading(btn, false, 'Send OTP'); }
  });
}

// ── Reset password ────────────────────────────────────────────────────────
function initReset() {
  const mobile = sessionStorage.getItem('otp_mobile');
  if (!mobile) { location.href = 'forgot-password.html'; return; }

  const demoOtp = sessionStorage.getItem('reset_otp');
  if (demoOtp) {
    const info = document.getElementById('demoOtpInfo');
    if (info) { info.textContent = `Demo OTP: ${demoOtp}`; info.style.display = 'block'; }
  }

  document.getElementById('resetForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp  = e.target.otp.value.trim();
    const pass = e.target.password.value;
    const conf = e.target.confirmPassword.value;
    if (otp.length !== 6)   { showAlert('resetAlert', 'Enter 6-digit OTP', 'error'); return; }
    if (pass.length < 6)    { showAlert('resetAlert', 'Password too short', 'error'); return; }
    if (pass !== conf)      { showAlert('resetAlert', 'Passwords do not match', 'error'); return; }

    const btn = e.target.querySelector('[type=submit]');
    setLoading(btn, true);
    try {
      const data = await api.post('api/auth.php?action=reset-password', { mobile, otp, password: pass });
      if (data.success) {
        sessionStorage.clear();
        showAlert('resetAlert', 'Password reset! Redirecting to login…', 'success');
        setTimeout(() => location.href = 'login.html', 1500);
      } else {
        showAlert('resetAlert', data.message, 'error');
      }
    } catch { showAlert('resetAlert', 'Network error.', 'error'); }
    finally { setLoading(btn, false, 'Reset Password'); }
  });
}

// ── Shared helpers ────────────────────────────────────────────────────────
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function clearErrors(form) {
  form.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
  const al = form.closest('[data-page]')?.querySelector('.alert');
  if (al) { al.textContent = ''; al.style.display = 'none'; }
}
function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.style.display = 'flex';
}
function setLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  if (!loading && label) btn.textContent = label;
  if (loading)           btn.textContent = '⏳ Please wait…';
}
