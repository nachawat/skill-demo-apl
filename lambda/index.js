// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface !== null && aplInterface !== undefined;
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        if (supportsAPL(handlerInput)){
            handlerInput.responseBuilder
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: require('./documents/launch.json'),
                    datasources: require('./documents/launch_datasource.json')
                });
        }
        const speakOutput = 'Bienvenue sur ma démo APL. Vous pouvez choisir entre les documents suivants: Simple, Karaoké, Vidéo ou Animation. Lequel choisissez-vous?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const BackUserEventHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent'
                && handlerInput.requestEnvelope.request.arguments.length > 0
                && handlerInput.requestEnvelope.request.arguments[0] === 'goBack';
    },
    handle(handlerInput) {
        return LaunchRequestHandler.handle(handlerInput);
    }
};
const APLIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'APLIntent')
            ||(Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent'
                && handlerInput.requestEnvelope.request.arguments.length > 0
                && handlerInput.requestEnvelope.request.arguments[0] === 'ListItemSelected');
    },
    handle(handlerInput) {
        let speechText;
        if (supportsAPL(handlerInput)){
            let templateId = 0;
            // Touch Event Request
            if (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent') {
                templateId = parseInt(handlerInput.requestEnvelope.request.arguments[1], 10);
            } else {
            // Voice Intent Request
                const templateSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'template');
                const templateEntityResolution = templateSlot.resolutions.resolutionsPerAuthority[0];
                templateId = parseInt(templateEntityResolution.values[0].value.id, 10);
            }
            console.log(templateId);
            speechText = "Veuillez utiliser un appareil avec écran pour voir le template demandé!";
            switch(templateId){
                case 1:
                    speechText = "Voici un document simple avec un seul composant!";
                    handlerInput.responseBuilder
                        .addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            document: require('./documents/simple.json'),
                            datasources: require('./documents/simple_datasource.json')
                        });
                    break;
                case 2:
                    speechText = "Voici un exemple de synchronisation entre le texte et la voix!";
                    handlerInput.responseBuilder
                        .addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            token: 'SpeechDocumentToken',
                            version: '1.1',
                            document: require('./documents/karaoke11.json'),
                            datasources: require('./documents/karaoke11_datasource.json')
                        })
                        .addDirective({
                            type: 'Alexa.Presentation.APL.ExecuteCommands',
                            token: 'SpeechDocumentToken',
                            commands: [{
                                type: 'SpeakItem',
                                componentId: 'idTextAlexa',
                                highlightMode: 'line'
                            }]
                        });
                    break;
                case 3:
                    speechText = "Voici un exemple de vidéo!";
                    handlerInput.responseBuilder
                        .addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            document: require('./documents/video.json'),
                            datasources: require('./documents/video_datasource.json')
                        });
                    break;
                case 4:
                    speechText = "Voici un exemple d'animation!";
                    handlerInput.responseBuilder
                        .addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            document: require('./documents/animation.json'),
                            datasources: require('./documents/animation_datasource.json')
                        });
                    break;
                default:
                    speechText = "Désolé, je n'ai pas trouvé d'exemple de document APL pour votre choix!";
                    break;
            }
        } else {
            speechText= "Votre appareil n'est pas compatible avec APL. Veuillez utiliser un appareil avec écran compatible avec APL pour tester les visuels demandés";
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Bonjour à tous';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Vous pouvez choisir entre les templates suivants: Simple, Karaoké, Vidéo ou animation. Lequel choissisez-vous?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Au revoir!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Vous avez invoqué l'intention: ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Désolé, je n'ai pas compris. Pouvez-vous reformuler ?`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * Intercepteur pour logger le JSON de la requête
 * RequestInterceptor
 */
const requestLogging = {
    process(handlerInput) {
        console.log(`Incoming request envelope: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    }
};
/**
 * Intercepteur pour logger le JSON de la réponse
 * ResponseInterceptor
 */
const responseLogging = {
    process(handlerInput, response) {
        console.log(`Outgoing response: ${JSON.stringify(response)}`);
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        BackUserEventHandler,
        APLIntentHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .addRequestInterceptors(requestLogging)
    .addResponseInterceptors(responseLogging)
    .lambda();
