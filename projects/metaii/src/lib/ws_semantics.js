
// init the I/O start interpreter
// function StartIntCompile() {
//     try {
//         compile(document.InputForm.InputText.value, document.CodeForm.CodeText.value);
//         // fill in output on both success and failure
//         document.OutputForm.OutputText.value = outbuf;
//     } catch(e) {
//         alert(e);
//         document.OutputForm.OutputText.value = e.toString();
//     }
// }

function StartExtractSyntax() {
    alert('removed - use original');
}

/* begin webpage utility functions */
function CharCodeString(s) {
    var ccs;
    var h;
    // ensure nonprinting character codes are visible in error messages
    ccs = "";
    for (var h = 0; h < s.length; h++) {
        if (s.charCodeAt(h) <= 32) {
            ccs += "<" + s.charCodeAt(h) + ">";
        } else {
            ccs += s.charAt(h);
        }
    }
    return ccs;
}

// compare Output and Code (i.e., did metacompile work?)
function StartCompare() {
    var i;
    var j;
    var k;
    var lcode;
    var lout;
    var msg;
    var ctx;
    var flag;
    // get a copy of the code and out strings
    lcode = document.CodeForm.CodeText.value;
    lout = document.OutputForm.OutputText.value;
    // test string case sensitive
    flag = true;
    i = 0;
    while (flag && i < lcode.length && i < lout.length) {
        flag = lcode.charAt(i) == lout.charAt(i);
        if (flag) i++;
    }
    // browser differences, allow differences in whitespace at end
    if (flag && i < lcode.length && i == lout.length) {
        j = i;
        while (flag && j < lcode.length) {
            flag =
                lcode.charAt(j) == " " ||
                lcode.charAt(j) == "\n" ||
                lcode.charAt(j) == "\r" ||
                lcode.charAt(j) == "\t";
            j++;
        }
    }
    if (flag && i == lcode.length && i < lout.length) {
        j = i;
        while (flag && j < lout.length) {
            flag =
                lout.charAt(j) == " " ||
                lout.charAt(j) == "\n" ||
                lout.charAt(j) == "\r" ||
                lout.charAt(j) == "\t";
            j++;
        }
    }
    // flag now determines same or different
    // if (flag) window.confirm("Same");
    if (!flag) {
        // i determines difference position
        msg = "Different\n";
        // place an <EOT> marker to make the string ends visible
        lcode = lcode + "<EOT>";
        lout = lout + "<EOT>";
        // provide difference context in output
        j = i - 20;
        if (j < 0) j = 0;
        k = i + 20;
        if (k > lout.length) k = lout.length;
        ctx = lout.substring(j, i) + "<scan>" + lout.substring(i, k);
        msg += "OUTPUT:\n" + ctx + "\n" + CharCodeString(ctx) + "\n\n";
        // provide difference context in code
        j = i - 20;
        if (j < 0) j = 0;
        k = i + 20;
        if (k > lcode.length) k = lcode.length;
        ctx = lcode.substring(j, i) + "<scan>" + lcode.substring(i, k);
        msg += "CODE:\n" + ctx + "\n" + CharCodeString(ctx) + "\n";
        window.alert(msg);
    }
}

function compile(g, p) {
    const c = new MetaII();
    return c.compile(g, p);
}

function StartCompile() {
    // fill in output on both success and failure
    document.OutputForm.OutputText.value = compile(document.InputForm.InputText.value, document.CodeForm.CodeText.value);
    // try {
    //     document.OutputForm.OutputText.value = compile(document.InputForm.InputText.value, document.CodeForm.CodeText.value);
    // } catch(e) {
    //     alert(e);
    //     document.OutputForm.OutputText.value = e.toString();
    // }
}

