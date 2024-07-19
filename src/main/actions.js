async function performActions(page, actions, data = {}) {
    const actionResults = [];
    for (const action of actions) {
        try {
            let targetElement = null;
            let frame = page;

            if (action.target.startsWith('//')) {
                const frames = page.frames();
                for (const f of frames) {
                    const handle = await f.evaluateHandle((xpath) => {
                        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        return result;
                    }, action.target);
                    targetElement = await handle.asElement();
                    if (targetElement) {
                        frame = f;
                        break;
                    }
                }
            } else if (action.target.startsWith('name=')) {
                const name = action.target.slice(5);
                targetElement = await page.$(`[name="${name}"]`);
                if (!targetElement) {
                    const frames = page.frames();
                    for (const f of frames) {
                        targetElement = await f.$(`[name="${name}"]`);
                        if (targetElement) {
                            frame = f;
                            break;
                        }
                    }
                }
            } else if (action.target.startsWith('#') || action.target.startsWith('.') || action.target.includes('[')) {
                targetElement = await page.$(action.target);
                if (!targetElement) {
                    const frames = page.frames();
                    for (const f of frames) {
                        targetElement = await f.$(action.target);
                        if (targetElement) {
                            frame = f;
                            break;
                        }
                    }
                }
            } else {
                targetElement = await page.$(`[id="${action.target}"]`);
                if (!targetElement) {
                    targetElement = await page.$(`[name="${action.target}"]`);
                    if (!targetElement) {
                        const frames = page.frames();
                        for (const f of frames) {
                            targetElement = await f.$(`[id="${action.target}"]`);
                            if (!targetElement) {
                                targetElement = await f.$(`[name="${action.target}"]`);
                            }
                            if (targetElement) {
                                frame = f;
                                break;
                            }
                        }
                    }
                }
            }

            if (!targetElement) {
                actionResults.push(`Fail: ${action.command} ${action.target} (element not found)`);
                continue;
            }

            switch (action.command) {
                case 'click':
                    await targetElement.click();
                    actionResults.push(`Success: ${action.command} ${action.target}`);
                    break;
                case 'type':
                    const fieldValue = data[action.value];
                    if (fieldValue !== undefined) {
                        await simulateHumanTyping(frame, action.target, fieldValue);
                        actionResults.push(`Success: ${action.command} ${action.target} with value ${fieldValue}`);
                    } else {
                        actionResults.push(`Fail: ${action.command} ${action.target} (value undefined)`);
                    }
                    break;
                case 'select':
                    const selectValue = data[action.value];
                    if (selectValue !== undefined) {
                        await frame.select(action.target, selectValue);
                        actionResults.push(`Success: ${action.command} ${action.target} with value ${selectValue}`);
                    } else {
                        actionResults.push(`Fail: ${action.command} ${action.target} (value undefined)`);
                    }
                    break;
                case 'printtext':
                    const text = await targetElement.evaluate(el => el.textContent);
                    actionResults.push(`Success: ${action.command} ${action.target} with value ${text}`);
                    break;
                default:
                    actionResults.push(`Fail: Unknown command ${action.command}`);
            }
        } catch (error) {
            actionResults.push(`Error: ${action.command} ${action.target} (${error.message})`);
        }
    }
    return actionResults;
}

async function simulateHumanTyping(page, selector, text) {
    try {
        let inputElement;

        if (selector.startsWith('//')) {
            const handle = await page.evaluateHandle((xpath) => {
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                return result;
            }, selector);
            inputElement = await handle.asElement();
        } else if (selector.startsWith('name=')) {
            const name = selector.slice(5);
            inputElement = await page.$(`[name="${name}"]`);
        } else {
            inputElement = await page.$(selector);
        }

        if (inputElement) {
            await inputElement.click();
            await page.evaluate(el => el.value = '', inputElement);
            await inputElement.focus();
            for (const char of text) {
                const typingDelay = Math.random() * 300 + 50;
                await inputElement.type(char, { delay: typingDelay });
            }
        }
    } catch (error) {
        console.error(`Error in simulateHumanTyping for selector ${selector}: ${error.message}`);
    }
}

module.exports = { performActions, simulateHumanTyping };
