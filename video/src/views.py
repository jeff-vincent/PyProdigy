upload_block = """
        <div style="background-color: #707bb2; margin: 15px; border-radius: 5px; padding: 15px; width: 300px">
        <b>Add to your video library: </b>
        <form action="/video/upload" method="post" enctype="multipart/form-data">
            <p><input type=file name=file value="Pick a Movie">
            <p>input type=text name=lesson_id value="Lesson ID">
            <p><input type=submit value="Upload">
        </form>
        </div>"""
video_library_block = """
        <form action="/app" method="get">
            <p><input type=submit value="Updated Video Library">
        </form>"""