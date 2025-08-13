import axios from 'axios';

export const saveAnswer = async (
  studentId: number,
  questionId: number,
  sectionId: number,
  selectedOption: string
) => {
  try {
    const response = await axios.post('http://localhost:5000/api/answers/save', {
      studentId,
      questionId,
      sectionId,
      selectedOption
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error saving answer:', error);
    throw error;
  }
};