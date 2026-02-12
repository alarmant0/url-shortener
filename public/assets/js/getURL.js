function getTinyURL() {
  console.log("=== getTinyURL called ===");

  const urlInput = document.getElementById("ph1");
  const codeInput = document.getElementById("ph2");
  const button = document.getElementById("submitBtn");
  const tokenInput = document.getElementById("turnstileToken");

  const url = urlInput?.value.trim() || "";
  const code = codeInput?.value.trim() || "";
  let token = (tokenInput?.value || "").trim();

  console.log("URL:", url);
  console.log("Custom code:", code);
  console.log("Token exists:", !!token);
  console.log("Token length:", token.length);

  if (!isValidUrl(url)) {
    console.error("Invalid URL");
    alert("Please enter a valid URL.");
    return;
  }

  if (code && !isValidCode(code)) {
    console.error("Invalid custom code");
    alert("Custom code must be max 8 letters/numbers.");
    return;
  }
  if (window.location.href.split("/")[2] === "127.0.0.1:8787") { // remove later
    token = "1x00000000000000000000AA"
  }
  if (!token) {
    console.error("Missing Turnstile token");
    alert("Please complete the Turnstile challenge.");
    return;
  }

  button.textContent = "Processing...";
  button.disabled = true;

  const payload = {
    full_url: url,
    custom_code: code,
    turnstileToken: token
  };

  console.log("Sending payload:", payload);

  fetch("/api/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(async (response) => {
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const text = await response.text();
      console.log("Raw response:", text);

      let data = null;
      try {
        data = text ? JSON.parse(text) : {};
        console.log("Parsed JSON:", data);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        data = { error: text || "Invalid server response" };
      }

      if (!response.ok) {
        console.warn("Request failed, resetting Turnstile + clearing token");

        if (window.turnstile) {
          console.log("Resetting Turnstile (error path)");
          window.turnstile.reset();
        }
        if (tokenInput) tokenInput.value = "";
      }

      if (response.status === 409) throw new Error("Custom code already exists.");
      if (response.status === 429) throw new Error("Too many requests. Try again later.");
      if (response.status === 403) throw new Error("Turnstile verification failed.");
      if (!response.ok) throw new Error(data?.error || "Something went wrong.");

      return data;
    })
    .then((data) => {
      console.log("Success data:", data);

      const result = document.getElementById("result");
      const shortInput = document.getElementById("shortResult");

      shortInput.value = data.url;
      result.classList.add("show");

      if (window.turnstile) {
        console.log("Resetting Turnstile (success path)");
        window.turnstile.reset();
      }

      if (tokenInput) tokenInput.value = "";

      console.log("=== Success ===");
    })
    .catch((error) => {
      console.error("Error occurred:", error);
      alert(error.message);
    })
    .finally(() => {
      button.textContent = "Shorten Link →";
      button.disabled = false;
      console.log("=== Finished ===");
    });
}

function copyToClipboard() {
  const input = document.getElementById("shortResult");
  if (!input?.value) {
    console.warn("Nothing to copy");
    return;
  }
  console.log("Copying to clipboard:", input.value);
  navigator.clipboard.writeText(input.value);
}

function isValidCode(custom_code) {
  const valid = /^[A-Za-z0-9]{1,8}$/.test(custom_code);
  console.log("isValidCode:", custom_code, valid);
  return valid;
}

function isValidUrl(url) {
  try {
    new URL(url);
    console.log("isValidUrl:", url, true);
    return true;
  } catch {
    console.error("isValidUrl:", url, false);
    return false;
  }
}
