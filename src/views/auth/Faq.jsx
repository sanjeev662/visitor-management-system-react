import React, { useState } from "react";
import Header from "../../components/header";

const Faq = () => {
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState(null);  // Stores the index of the expanded question

  const toggleQuestion = (index) => {
    setExpandedQuestionIndex(expandedQuestionIndex === index ? null : index);
  };

  return (
    <div className="m-5">
      <Header title="Frequently Asked Question" subtitle="Frequently Asked Questions" />

      <div className="divide-y divide-gray-200 space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="pt-4">
            <button
              className="flex justify-between items-center w-full text-left text-lg text-green-700 font-semibold bg-green-100 p-4 rounded-lg hover:bg-green-200 focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-75"
              onClick={() => toggleQuestion(index)}
            >
              {question.title}
              <span className="transform transition-transform duration-200 text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${expandedQuestionIndex === index ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
            </button>
            {expandedQuestionIndex === index && (
              <div className="mt-2 p-4 text-gray-700 bg-white rounded-b-lg">
                <p>{question.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const questions = [
  {
    title: "How to Create an Appointment",
    answer: "Click on the 'create appointment' button from the sidebar or the dashboard, then fill in the details and click on the create button.",
  },
  {
    title: "How to Add a new Visitor",
    answer: "Click on the 'add new visitor' button, then take or select a picture. If there are multiple pictures, fill in the details and finally submit after signature.",
  },
  {
    title: "How to Generate a Pass",
    answer: "You can generate a pass directly from the visitor table by filling the details, or by choosing from the face recognition table.",
  },
  {
    title: "How to Add an Employee",
    answer: "By clicking on the 'add employee' button from the sidebar and filling in the details in the form.",
  },
  {
    title: "How Can We See Visitors/Passes/Appointments/Employees",
    answer: "We can easily see all details listing from the sidebar.",
  },
];

export default Faq;

