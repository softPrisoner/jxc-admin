export function isEmpty(...str) {
    return str.some(i => i === undefined || i === null || i === '')
}

export function emptyOrDefault(v, defaultValue = '') {
    return isEmpty(v) ? defaultValue : v
}

export function getInitialValue(v) {
    if (v === undefined || v === null) v = null
    else if (typeof v === 'string') v = ''
    else if (typeof v === 'boolean') v = false
    else if (typeof v === 'number') v = 0
    else if (typeof v === 'object') v = {}
    else if (Array.isArray(v)) v = []
}

//简单重置对象属性
export function resetObj(obj) {
    if (isEmpty(obj)) return
    Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key])) {
            obj[key] = []
        }
        else if (typeof obj[key] === 'number') {
            obj[key] = 0
        }
        else if (typeof obj[key] === 'boolean') {
            obj[key] = false
        }
        else if (obj[key] !== null && typeof obj[key] === 'object') {
            resetObj(obj[key])
        }
        else obj[key] = null
    })
}

//简单合并对象
export function mergeObj(target, source) {
    if (isEmpty(target, source)) return

    for (const key of Object.keys(target)) {
        if (!(key in source)) continue

        //数组类型直接赋值，不做深拷贝
        if (Array.isArray(target[key])) {
            target[key] = source[key] || []
            continue
        }

        //number类型不考虑NaN
        if (typeof target[key] === 'number') {
            target[key] = source[key] || 0
            continue
        }

        //非空对象递归处理
        if (target[key] !== null && typeof target[key] === 'object') {
            mergeObj(target[key], source[key])
            continue
        }

        target[key] = source[key]
    }
}

export function timeFormat(fmt, date = new Date()) {
    if (isEmpty(fmt)) fmt = 'yyyy-MM-dd HH:mm:ss'

    const o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    }

    if (/(y+)/.test(fmt)) {
        const replace = (date.getFullYear() + "").substring(4 - RegExp.$1.length)
        fmt = fmt.replace(RegExp.$1, [...replace].join(''))
    }

    for (const k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            const firstMatch = RegExp.$1
            const replace = firstMatch.length === 1 ? o[k] : ("00" + o[k]).substring(("" + o[k]).length)
            fmt = fmt.replace(firstMatch, [...replace].join(''))
        }
    }

    return fmt
}

export function debounce(func, wait = 100, immediate = false) {
    let timeout, args, context, timestamp, result

    const later = function () {
        // 据上一次触发时间间隔
        const last = new Date().getTime() - timestamp

        // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
        if (last < wait && last > 0) {
            timeout = window.setTimeout(later, wait - last)
        }
        else {
            timeout = null
            // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
            if (!immediate) {
                result = func.apply(context, args)
                if (!timeout) context = args = null
            }
        }
    }

    return function () {
        context = this
        args = arguments
        timestamp = new Date().getTime()
        const callNow = immediate && !timeout
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = window.setTimeout(later, wait)
        if (callNow) {
            result = func.apply(context, args)
            context = args = null
        }

        return result
    }
}

export function throttle(func, delay = 100) {
    let timeoutID
    let lastExec = 0

    function wrapper() {
        const self = this
        const elapsed = Date.now() - lastExec
        const args = arguments

        function exec() {
            lastExec = Date.now()
            func.apply(self, args)
        }

        window.clearTimeout(timeoutID)

        if (elapsed > delay) exec()
        else timeoutID = window.setTimeout(exec, delay - elapsed)
    }

    return wrapper
}

/**
 * 循环等待成功事件
 * @param success 判断是否成功，true or false
 * @param callback 成功后的回调
 * @param interval 循环间隔，毫秒
 * @param maxTryTime 最大循环次数，超出reject，小于1视为Infinity
 */
export function waitUntilSuccess(success, callback, interval = 1000, maxTryTime = 0) {
    return new Promise((resolve, reject) => {
        let fun,
            count = 0

        const check = () => {
            if (success()) {
                window.clearInterval(fun)
                typeof callback === 'function' && callback()
                return resolve()
            }
            if (maxTryTime >= 1) {
                count++
                if (count >= maxTryTime) return reject()
            }
        }

        if (success()) return check()

        fun = window.setInterval(check, interval)
    })
}

//删除所有url参数
export function delAllUrlParam() {
    let paramStartIndex = location.href.indexOf('?')
    if (paramStartIndex > -1) {
        const href = location.href.substring(0, paramStartIndex)
        history.replaceState(null, null, [...href].join(''))
    }
}

//将传入对象的所有函数的this绑定为其自身
export function bindThis(obj, root = obj) {
    if (!obj || typeof obj !== 'object') return

    Object.entries(obj).forEach(([k, v]) => {
        if (typeof v === 'function') {
            obj[k] = v.bind(root)
        }
        bindThis(v, root)
    })

    return obj
}

export function deepClone(source) {
    if (source === null || typeof source !== 'object' || source instanceof Promise) {
        return source
    }

    if (Array.isArray(source)) {
        return source.map(i => deepClone(i))
    }
    else {
        return Object.keys(source).reduce((obj, key) => {
            obj[key] = deepClone(source[key])
            return obj
        }, {})
    }
}
