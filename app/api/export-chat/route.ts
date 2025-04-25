import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json()
    const { messages } = body as { messages: Message[] }
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 })
    }
    
    // Create a temporary JSON file with the messages
    const tempFileName = `temp_chat_export_${Date.now()}.json`
    const tempFilePath = path.join(process.cwd(), tempFileName)
    
    // Write messages to temporary file
    fs.writeFileSync(tempFilePath, JSON.stringify(messages, null, 2))
    
    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'backend', 'export_to_excel.py')
    
    // Execute the Python script to convert JSON to Excel
    const { stdout, stderr } = await execAsync(`python ${scriptPath} ${tempFilePath}`)
    
    if (stderr) {
      console.error('Python script error:', stderr)
      throw new Error('Failed to convert to Excel: ' + stderr)
    }
    
    // Get the Excel file path from stdout (Python script will print the path)
    const excelFilePath = stdout.trim()
    
    // Clean up the temporary JSON file
    fs.unlinkSync(tempFilePath)
    
    // Return success response with the Excel file path
    return NextResponse.json({ 
      success: true, 
      message: 'Chat messages exported to Excel successfully',
      filePath: excelFilePath
    })
    
  } catch (error) {
    console.error('Error exporting chat to Excel:', error)
    return NextResponse.json({ 
      error: 'Failed to export chat to Excel', 
      details: (error as Error).message 
    }, { status: 500 })
  }
} 