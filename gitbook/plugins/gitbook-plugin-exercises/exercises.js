require(["gitbook"], function(gitbook) {

    var LANGUAGES = {
        "javascript": {
            id: "javascript",
            assertCode: "function assert(condition, message) { \nif (!condition) { \n throw message || \"Assertion failed\"; \n } \n }\n",
            REPL: JSREPL,
            sep: ";\n",
        }
    };


    var evalJS = function(lang, code, callback) {
        var ready = false;
        var finished = false;

        var finish = function() {
            if(finished) {
                return console.error('Already finished');
            }
            finished = true;
            return callback.apply(null, arguments);
        };

        var repl;

        // Handles all our events
        var eventHandler = function(data, eventType) {
            switch(eventType) {
                case 'progress':
                    // Update UI loading bar
                    break;
                case 'timeout':
                    finish(new Error(data));
                    break;
                case 'result':
                    finish(null, {
                        value: data,
                        type: 'result'
                    });
                    break;
                case 'error':
                    if(ready) {
                        return finish(null, {
                            value: data,
                            type: 'error'
                        });
                    }
                    return finish(new Error(data));
                    break
                case 'ready':
                    // We're good to get results and stuff back now
                    ready = true;
                    // Eval our code now that the runtime is ready
                    repl.eval(code);
                    break;
                default:
                    console.log('Unhandled event =', eventType, 'data =', data);
            }
        };

        repl = new lang.REPL({
            input: eventHandler,
            output: eventHandler,
            result: eventHandler,
            error: eventHandler,
            progress: eventHandler,
            timeout: {
                time: 30000,
                callback: eventHandler
            }
        });

        repl.loadLanguage(lang.id, eventHandler);
    };

    var execute = function(lang, solution, validation, context, callback) {
        // Language data
        var langd =  LANGUAGES[lang];

        // Check language is supported
        if (!langd) return callback(new Error("Language '"+lang+"' not available for execution"));

        // Validate with validation code
        var code = [
            context,
            solution,
            langd.assertCode,
            validation,
        ].join(langd.sep);
        evalJS(langd, code, function(err, res) {
            if(err) return callback(err);

            if (res.type == "error") callback(new Error(res.value));
            else callback(null, res.value);
        });
    };

    // Bind an exercise
    // Add code editor, bind interractions
    var prepareExercise = function($exercise) {
        var codeSolution = $exercise.find(".code-solution").text();
        var codeValidation = $exercise.find(".code-validation").text();
        var codeContext = $exercise.find(".code-context").text();

        var editor = ace.edit($exercise.find(".editor").get(0));
        editor.setTheme("ace/theme/tomorrow");
        editor.getSession().setUseWorker(false);
        editor.getSession().setMode("ace/mode/javascript");

        editor.commands.addCommand({
            name: "submit",
            bindKey: "Ctrl-Return|Cmd-Return",
            exec: function() {
                $exercise.find(".action-submit").click();
            }
        });

        // Submit: test code
        $exercise.find(".action-submit").click(function(e) {
            e.preventDefault();

            gitbook.events.trigger("exercise.submit", {type: "code"});

            execute("javascript", editor.getValue(), codeValidation, codeContext, function(err, result) {
                $exercise.toggleClass("return-error", err != null);
                $exercise.toggleClass("return-success", err == null);
                if (err) $exercise.find(".alert-danger").text(err.message || err);
            });
        });

        // Set solution
        $exercise.find(".action-solution").click(function(e) {
            e.preventDefault();

            editor.setValue(codeSolution);
            editor.gotoLine(0);
        });
    };

    // Prepare all exercise
    var init = function() {
        gitbook.state.$book.find(".exercise").each(function() {
            prepareExercise($(this));
        });
    };

    gitbook.events.bind("page.change", function() {
        init();
    });
});