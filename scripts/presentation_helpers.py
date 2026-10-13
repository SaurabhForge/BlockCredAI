import win32com.client
import os
import sys
import shutil

# Color constants for PowerPoint COM (BGR format: B * 65536 + G * 256 + R)
# Theme colors:
COLOR_HEADER_TITLE = 801924      # Maroon/Brown theme color: RGB(132, 60, 12) -> 12*65536 + 60*256 + 132 = 801924
COLOR_BODY_TITLE = 12611584     # Navy/Teal theme: RGB(0, 112, 192) -> 192*65536 + 112*256 + 0 = 12611584
COLOR_DARK_TEXT = 0x222222      # Charcoal/Dark text: RGB(34, 34, 34)
COLOR_MUTED_TEXT = 0x555555     # Slate: RGB(85, 85, 85)
COLOR_WHITE = 0xFFFFFF

BASE_DIR = r"c:\Users\Saurabh Kumar\OneDrive\Desktop\BlockCredAI-main"
ASSETS_DIR = os.path.join(BASE_DIR, "presentation_assets")
TEMPLATE_PPT = r"C:\Users\Saurabh Kumar\Downloads\ppt_template.ppt"
OUTPUT_PPTX = os.path.join(BASE_DIR, "BlockCredAI_Presentation_Report.pptx")
OUTPUT_PDF = os.path.join(BASE_DIR, "BlockCredAI_Presentation_Report.pdf")

# Dimensions in points
SLIDE_WIDTH = 960.0
SLIDE_HEIGHT = 504.0
TOP_MARGIN = 80.0       # Header ends around 72.0
BOTTOM_MARGIN = 480.0   # Footer starts at 482.0
USABLE_HEIGHT = BOTTOM_MARGIN - TOP_MARGIN  # 400.0 points
LEFT_MARGIN = 35.0
USABLE_WIDTH = SLIDE_WIDTH - 2 * LEFT_MARGIN # 890.0 points

def format_title(shape, text):
    if shape.HasTextFrame:
        tf = shape.TextFrame
        tf.TextRange.Text = text
        tf.TextRange.Font.Name = "Footlight MT Light"
        tf.TextRange.Font.Size = 32
        tf.TextRange.Font.Bold = -1
        tf.TextRange.Font.Color.RGB = COLOR_HEADER_TITLE

def set_slide_text(shape, bullet_items, font_size=15):
    """
    bullet_items is a list of tuples: (heading, body) or just strings.
    """
    if not shape.HasTextFrame:
        return
    tf = shape.TextFrame
    tr = tf.TextRange
    
    full_text = ""
    for item in bullet_items:
        if isinstance(item, tuple):
            full_text += f"{item[0]}: {item[1]}\n"
        else:
            full_text += f"{item}\n"
    full_text = full_text.rstrip("\n")
    
    tr.Text = full_text
    tr.Font.Name = "Calibri"
    tr.Font.Size = font_size
    tr.Font.Color.RGB = COLOR_DARK_TEXT
    tr.ParagraphFormat.LineRuleWithin = 0
    tr.ParagraphFormat.SpaceWithin = 1.15
    tr.ParagraphFormat.SpaceAfter = 6
    
    # Bold the headings
    p_idx = 1
    for item in bullet_items:
        if p_idx <= tr.Paragraphs().Count:
            p = tr.Paragraphs(p_idx)
            p.Font.Size = font_size
            if isinstance(item, tuple):
                # Bold just the title part
                head_len = len(item[0]) + 1
                try:
                    p.Characters(1, head_len).Font.Bold = -1
                    p.Characters(1, head_len).Font.Color.RGB = COLOR_BODY_TITLE
                except:
                    pass
            p_idx += 1

def add_full_image_slide(slide, image_path, title_text):
    # Find and update title
    for sh in slide.Shapes:
        if sh.HasTextFrame and sh.TextFrame.HasText:
            txt = sh.TextFrame.TextRange.Text.strip()
            if any(h in txt for h in ["SYSTEM", "IMPLEMENTATION", "SCREENSHOT", "ABSTRACT", "INTRO"]):
                format_title(sh, title_text)
                break
                
    # Remove old content shape
    shapes_to_delete = []
    for sh in slide.Shapes:
        if "Shape;207" in sh.Name or (sh.Type == 1 and sh.Top > 75 and sh.Top < 450):
            shapes_to_delete.append(sh)
    for sh in shapes_to_delete:
        try:
            sh.Delete()
        except:
            pass

    # Add Picture centered in usable area
    # Max image dimensions: 880 width, 380 height
    img_left = 40.0
    img_top = 85.0
    img_w = 880.0
    img_h = 385.0
    slide.Shapes.AddPicture(
        FileName=image_path,
        LinkToFile=False,
        SaveWithDocument=True,
        Left=img_left,
        Top=img_top,
        Width=img_w,
        Height=img_h
    )

def add_two_images_slide(slide, img1_path, img2_path, label1, label2, title_text):
    for sh in slide.Shapes:
        if sh.HasTextFrame and sh.TextFrame.HasText:
            txt = sh.TextFrame.TextRange.Text.strip()
            if any(h in txt for h in ["SCREENSHOT", "SYSTEM", "IMPLEMENTATION"]):
                format_title(sh, title_text)
                break
                
    shapes_to_delete = []
    for sh in slide.Shapes:
        if "Shape;207" in sh.Name or (sh.Type == 1 and sh.Top > 75 and sh.Top < 450):
            shapes_to_delete.append(sh)
    for sh in shapes_to_delete:
        try:
            sh.Delete()
        except:
            pass

    # Place two images side by side
    gap = 20.0
    img_w = 430.0
    img_h = 280.0
    top_pos = 100.0
    left1 = 40.0
    left2 = left1 + img_w + gap

    slide.Shapes.AddPicture(
        FileName=img1_path,
        LinkToFile=False,
        SaveWithDocument=True,
        Left=left1,
        Top=top_pos,
        Width=img_w,
        Height=img_h
    )
    
    slide.Shapes.AddPicture(
        FileName=img2_path,
        LinkToFile=False,
        SaveWithDocument=True,
        Left=left2,
        Top=top_pos,
        Width=img_w,
        Height=img_h
    )

    # Add label caption under image 1
    lbl1 = slide.Shapes.AddTextbox(1, left1, top_pos + img_h + 8, img_w, 40)
    lbl1.TextFrame.TextRange.Text = label1
    lbl1.TextFrame.TextRange.Font.Name = "Calibri"
    lbl1.TextFrame.TextRange.Font.Size = 13
    lbl1.TextFrame.TextRange.Font.Bold = -1
    lbl1.TextFrame.TextRange.Font.Color.RGB = COLOR_BODY_TITLE
    lbl1.TextFrame.TextRange.ParagraphFormat.Alignment = 2 # Center

    # Add label caption under image 2
    lbl2 = slide.Shapes.AddTextbox(1, left2, top_pos + img_h + 8, img_w, 40)
    lbl2.TextFrame.TextRange.Text = label2
    lbl2.TextFrame.TextRange.Font.Name = "Calibri"
    lbl2.TextFrame.TextRange.Font.Size = 13
    lbl2.TextFrame.TextRange.Font.Bold = -1
    lbl2.TextFrame.TextRange.Font.Color.RGB = COLOR_BODY_TITLE
    lbl2.TextFrame.TextRange.ParagraphFormat.Alignment = 2 # Center

print("Helper functions defined successfully!")
