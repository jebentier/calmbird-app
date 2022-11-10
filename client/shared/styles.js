import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  tweet: {
    padding: 15,
    flex: 1,
  },
  tweetAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyItems: 'flex-start',
    marginBottom: 10,
  },
  tweetAuthorImage: {
    marginRight: 10,
  },
  tweetAuthorName: {
    fontSize: 16,
    margin: 'auto',
    marginRight: 5,
  },
  tweetAuthorUsername: {
    fontSize: 12,
    margin: 'auto',
    color: '#666',
  },
  timestamp: {
    fontSize: 11,
  },
  descriptionText: {
    fontSize: 12,
    flex: 1,
    textAlign: 'justify',
    flexWrap: 'wrap'
  },
  badge: {
    padding: 10,
  }
});
