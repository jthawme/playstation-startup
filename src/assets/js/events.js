export function addEventListenerOnce(el, event, cb, other) {
  const capturedCb = (e) => {
    removeListener();
    cb(e);
  };
  const removeListener = () => {
    el.removeEventListener(event, capturedCb);
  };

  el.addEventListener(event, cb, other);

  return removeListener;
}
