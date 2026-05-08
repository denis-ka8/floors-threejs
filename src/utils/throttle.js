function throttle(callee, timeout) {
    let timer = null;

    return function perform(...args) {
        if (timer) return;

        timer = setTimeout(() => {
            callee(...args);
            timer = null;
        }, timeout);
    }
}

export { throttle };