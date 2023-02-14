function Validator(formSelector) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    const formRules = {}
    // Quy ước các rule
    const ValidatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function(value) {
            regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
            }
        }
    }
    
    formElement = document.querySelector(formSelector)
    // Chỉ xử lí khi form element có trong DOM
    if(formElement) {
        var inputs = formElement.querySelectorAll('input[name][rule]')
        Array.from(inputs).forEach(function(input) {
            var rules = input.getAttribute('rule').split('|')
            rules.forEach(function(rule) {
                var isRuleHasValue = false
                var ruleInfo

                if(rule.includes(':')) {
                    isRuleHasValue = true
                    ruleInfo = rule.split(':')
                }
                
                var f = ValidatorRules[rule]

                if(isRuleHasValue) {
                    rule = ruleInfo[0]
                    f = ValidatorRules[rule](ruleInfo[1])
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(f)
                }
                else {
                    formRules[input.name] = [f]
                }
            })

            // Lắng nghe các sự kiện để validate từ input
            input.onblur = handleValidate
            input.oninput = handleInput
            

        })
        // Lắng nghe sự kiên submit
        formElement.onsubmit = handleSubmit

        // Hàm thực hiện các validate
        function handleValidate(e) {
            var input = e.target
            var rules = formRules[input.name]
            var errorMessage

            for(rule of rules) {
                errorMessage = rule(input.value)
                if(errorMessage) {
                    break
                }
            }

            var formGroupElement = getParent(input, '.form-group')
            var errorElement = formGroupElement.querySelector('.form-message')
            if(errorMessage) {
                formGroupElement.classList.add('invalid')
                errorElement.innerText = errorMessage
            }
            else {
                formGroupElement.classList.remove('invalid')
                errorElement.innerText = ''
            }

            return !errorMessage
            
        }

        function handleInput(e) {
            var input = e.target
            formGroupElement = getParent(input, '.form-group')
            formGroupElement.classList.remove('invalid')
            errorElement = formGroupElement.querySelector('.form-message')
            errorElement.innerText = ''
        }

        var _this = this
        function handleSubmit(e) {
            e.preventDefault()

            var isValid = true

            var inputs = formElement.querySelectorAll('input[name][rule]')
            for(input of inputs) {
                check = handleValidate({
                    target: input
                })
                if(!check) {
                    isValid = false
                }
            }

            if(isValid) {
                var formValues = Array.from(inputs).reduce(function(values, input) {
                    values[input.name] = input.value
                    return values
                },{})


                if((typeof _this.onSubmit) === 'function'){
                    _this.onSubmit(formValues)
                }else {
                    formElement.submit()
                }
               
            }

        }
        

    }
}