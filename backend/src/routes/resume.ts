import express from 'express';
import { extractTextFromPdf } from '../function/pdfParser.js';
import { getUploadedResumeFile, handleResumeUpload } from '../controllers/resumeOps.js';

export const resumeRouter = express.Router();

resumeRouter.post('/upload', handleResumeUpload, async (req, res) => {
    try {
        const resumePdf = getUploadedResumeFile(req);

        if(!resumePdf) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }

        let resumeData = await extractTextFromPdf(resumePdf.buffer);



        res.status(200).json({ 
            message: 'Resume uploaded successfully',
            resumeData
         });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ error: 'Failed to upload resume' });
    }
});