export async function waitForFreighter(timeout = 4000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (window.freighter) return true;
    await new Promise(r => setTimeout(r, 200));
  }

  return false;
}

export async function connectFreighter() {
  if (!window.freighter) {
    alert("Freighter extension not detected");
    return { success: false };
  }

  try {
    const allowed = await window.freighter.requestAccess();
    if (!allowed) return { success: false };

    const publicKey = await window.freighter.getPublicKey();

    return {
      success: true,
      publicKey,
      walletName: "Freighter"
    };
  } catch (e) {
    alert(e.message);
    return { success: false };
  }
}