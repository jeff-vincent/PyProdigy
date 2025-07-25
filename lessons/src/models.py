

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    expected_output = Column(String, index=True)
    example_code = Column(String, index=True)
    text = Column(String, index=True)
    display_index = Column(Integer)
    tests = Column(String)

    topic = relationship("Topic", back_populates="lessons")

    __table_args__ = (
        UniqueConstraint('name', 'topic_id', name='uq_topic_lesson'),
    )
