import sys
import os
import io
import yaml

IN_KEY_QUESTION = 'Question'
IN_KEY_ANSWER = 'Answer'
IN_KEY_TOPIC = 'Topic'

OUT_HEADER_FIELDS = ['Question', 'Answer', 'Source', 'Metadata', 'SuggestedQuestions', 'IsContextOnly', 'Prompts', 'QnaId']
OUT_COL_SEP = '\t'
OUT_ROW_SEP = '\n'

def load_yaml(path):
    with open(path, 'r', encoding="UTF-8") as stream:
        return yaml.safe_load(stream)

def write_header(path):
    with open(path, 'w', encoding="UTF-8") as f:
        f.write(OUT_COL_SEP.join(OUT_HEADER_FIELDS))
        f.write(OUT_ROW_SEP)

def write_line(path, data):
    with open(path, 'a', encoding="UTF-8") as f:
        f.write(OUT_COL_SEP.join(map(clean_str, map(str, data))))
        f.write(OUT_ROW_SEP)

def clean_str(raw):
    out = raw
    # Remove tabs
    out = out.replace('\t', ' ')
    # Quote line breaks
    out = out.replace('\r\n', '\\r\\n')
    out = out.replace('\n', '\\r\\n')
    # Strip quotes
    out = out.replace('"', '')
    return out

def convert(input_path, output_path):
    
    # Read the YAML data
    qnas = load_yaml(input_path)
    
    # Write the header
    write_header(output_path)

    for i, qna in enumerate(qnas):
        question = qna[IN_KEY_QUESTION]
        answer = qna[IN_KEY_ANSWER]
        topic = qna[IN_KEY_TOPIC]

        metadata = ""
        suggested_question = "[]"
        is_context_only = "false"
        prompts = "[]"
        qna_id = i + 1

        # Construct the data
        data = [
            question,
            answer,
            input_path,
            metadata,
            suggested_question,
            is_context_only,
            prompts,
            qna_id
        ]

        # Write a new line
        write_line(output_path, data)

    
def main():
    if len(sys.argv) < 1:
        print("Please provide a file to convert")
        return
    if len(sys.argv) < 2:
        print("Please provide an output name")
        return
    
    convert(sys.argv[1], sys.argv[2])

if __name__ == "__main__":
    main()