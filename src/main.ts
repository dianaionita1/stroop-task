import { initJsPsych } from 'jspsych';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import 'jspsych/css/jspsych.css';

var timeline=[]

var jsPsych= initJsPsych({
  on_finish:function(){
    jsPsych.data.displayData();
  }
})

var welcome ={
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Welcome to the experiment. Press any key to begin"
};

timeline.push(welcome);

var instructions={
  type:jsPsychHtmlKeyboardResponse,
  stimulus: "color of the text, b for blue, g for green, r for red, y for yellow",
  post_trial_gap: 2000
};

timeline.push(instructions);

var words=[
  {word: "blue"},
  {word:"red"},
  {word:"green"},
  {word:"yellow"}
];

var color_stimuli =[
  {color: "blue", correct_response: "b" },
  {color: "red", correct_response: "r" },
  {color: "green", correct_response: "g" },
  {color: "yellow", correct_response: "y" }
];

var test_stimuli= color_stimuli.flatMap(c=> words.flatMap(w=> [
  {word: w.word,color: c.color, correct_response: c.correct_response}]));
//console.log(test_stimuli);
//console.log(color_stimuli);
var fixation ={
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS",
  trial_duration: function(){
    return jsPsych.randomization.sampleWithoutReplacement([250,500,750,1000,1250,1500,1750,2000],1)[0];
  },
  data:{
    task:'fixation'
  }
};
console.log(test_stimuli);
var test={
  type:jsPsychHtmlKeyboardResponse,
  color: jsPsych.timelineVariable('color'),
  stimulus: function(){
  return `<div style="color: ${jsPsych.evaluateTimelineVariable('color')}; font-size:60px">${jsPsych.evaluateTimelineVariable('word')}</div>`;
},
  choices:['b','r','g','y'],
  data:{
    task: 'response',
    correct_response: jsPsych.timelineVariable('correct_response')
  },
  on_finish: (data: any) =>{
    data.correct=jsPsych.pluginAPI.compareKeys(data.correct_response,data.response);
  }
};
var test_procedure = {
  timeline:[fixation,test],
  timeline_variables: test_stimuli,
  repetitions:1,
  randomize_order:true
};

timeline.push(test_procedure);

var debrief_block={
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function(){ 

    var trials= jsPsych.data.get().filter({task: 'response'});
    var correct_trials= jsPsych.data.get().filter({correct:true});
    var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    var rt = Math.round(correct_trials.select('rt').mean());

    return `<p>You responded correctly on ${accuracy}% of the trials.</p>
          <p>Your average response time was ${rt}ms.</p>
          <p>Press any key to complete the experiment. Thank you!</p>`;

      }
};

timeline.push(debrief_block);

jsPsych.run(timeline);




