import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface MCQSectionProps {
  questions: any[];
  answers: Record<number, string>;
  onAnswerChange: (answers: Record<number, string>) => void;
}

const MCQSection: React.FC<MCQSectionProps> = ({ questions, answers, onAnswerChange }) => {
  const handleAnswerChange = (questionId: number, value: string) => {
    onAnswerChange({ ...answers, [questionId]: value });
  };

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {index + 1}: {question.questionText}
            </CardTitle>
            {question.questionImage && (
              <div className="mt-2">
                <img 
                  src={question.questionImage} 
                  alt="Question" 
                  className="max-w-full h-auto rounded border"
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {["A", "B", "C", "D"].map((option) => (
                <div key={option} className="flex items-start space-x-3 p-3 border rounded mb-2 hover:bg-gray-50">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} className="mt-1" />
                  <Label htmlFor={`${question.id}-${option}`} className="flex-1 cursor-pointer">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">{option})</span>
                      <div className="flex-1">
                        <div>{question[`option${option}`]}</div>
                        {question[`option${option}Image`] && (
                          <img 
                            src={question[`option${option}Image`]} 
                            alt={`Option ${option}`} 
                            className="mt-2 max-w-xs h-auto rounded border"
                          />
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MCQSection;