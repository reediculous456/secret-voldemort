import React from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import { PLAYERCOLORS, MODERATORS, ADMINS, EDITORS } from '../../constants';
import { loadReplay, toggleNotes, updateUser } from '../../actions/actions';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { renderEmotesButton, processEmotes } from '../../emotes';
import { Scrollbars } from 'react-custom-scrollbars';

const mapDispatchToProps = dispatch => ({
	loadReplay: summary => dispatch(loadReplay(summary)),
	toggleNotes: notesStatus => dispatch(toggleNotes(notesStatus)),
	updateUser: userInfo => dispatch(updateUser(userInfo))
});

const mapStateToProps = ({ notesActive }) => ({ notesActive });

class Gamechat extends React.Component {
	constructor() {
		super();

		this.handleSendChat = this.handleSendChat.bind(this);
		this.handleChatScrolled = this.handleChatScrolled.bind(this);

		this.state = {
			chatData: {}
		};
	}

	componentDidMount() {
		this.scrollChats();

		$(this.leaveGameModal).on('click', '.leave-game.button', () => {
			// modal methods dont seem to work.
			window.location.hash = '#/';
			$(this.leaveGameModal).modal('hide');
		});

		$(this.leaveTournyQueueModal).on('click', '.leave-tourny.button', () => {
			window.location.hash = '#/';
			$(this.leaveTournyQueueModal).modal('hide');
		});

		$(this.leaveTournyQueueModal).on('click', '.leave-tourny-queue.button', () => {
			window.location.hash = '#/';
			$(this.leaveTournyQueueModal).modal('hide');
		});
	}

	componentDidUpdate(prevProps, nextProps) {
		const { userInfo, gameInfo } = this.props;
		this.scrollChats();

		if (
			(prevProps &&
				userInfo.userName &&
				userInfo.isSeated &&
				prevProps.gameInfo.publicPlayersState.filter(player => player.isDead).length !== gameInfo.publicPlayersState.filter(player => player.isDead).length &&
				gameInfo.publicPlayersState.find(player => userInfo.userName === player.userName).isDead) ||
			(prevProps &&
				userInfo.userName &&
				gameInfo.gameState.phase === 'presidentSelectingPolicy' &&
				((gameInfo.publicPlayersState.find(player => userInfo.userName === player.userName) &&
					gameInfo.publicPlayersState.find(player => userInfo.userName === player.userName).governmentStatus === 'isPresident') ||
					(gameInfo.publicPlayersState.find(player => userInfo.userName === player.userName) &&
						gameInfo.publicPlayersState.find(player => userInfo.userName === player.userName).governmentStatus === 'isChancellor')) &&
				prevProps.gameInfo.gameState.phase !== 'presidentSelectingPolicy')
		) {
			this.setState({ inputValue: '' });
			$(this.gameChatInput).blur();
		}

		if (prevProps.notesActive && !nextProps.notesActive && this.state.notesEnabled) {
			this.setState({ notesEnabled: false });
		}
	}

	handleSendChat(e) {
		const currentValue = this.gameChatInput.value;
		const { gameInfo } = this.props;

		e.preventDefault();

		if (currentValue.length < 300 && currentValue && !$('.expando-container + div').hasClass('disabled')) {
			const chat = {
				chat: currentValue,
				uid: gameInfo.general.uid
			};

			this.props.socket.emit('addNewGameChat', chat);

			this.gameChatInput.value = '';

			this.gameChatInput.blur();
			setTimeout(() => {
				if (this.gameChatInput) {
					this.gameChatInput.focus();
				}
			}, 80);
		}
	}

	formatSingleChat(data) {
		const { userInfo, userList } = this.props;
		const { gameSettings } = userInfo;
		const isMod =
			MODERATORS.includes(chat[1]) ||
			EDITORS.includes(chat[1]) ||
			ADMINS.includes(chat[1]);
		const user = Object.keys(userList).length ? userList.list.find(player => player.userName === chat[1]) : undefined;
		const userClasses =
			!user || (gameSettings && gameSettings.disablePlayerColorsInChat)
				? 'chat-user'
				: PLAYERCOLORS(user, !(gameSettings && gameSettings.disableSeasonal), 'chat-user');


		return data.list.map(message => {
			let timestamp = '';
			if (userInfo.gameSettings && userInfo.gameSettings.enableTimestamps) {
				timestamp = (<span className="timestamp">{moment(chat[0]).format('HH:mm')} </span>);
			}
			return (
				{timestamp}
				<span className={userClasses}>
					{MODERATORS.includes(chat[1]) && <span className="moderator-name">(M) </span>}
					{EDITORS.includes(chat[1]) && <span className="editor-name">(E) </span>}
					{ADMINS.includes(chat[1]) && <span className="admin-name">(A) </span>}
					<a
						href={chat.isBroadcast ? '#/profile/' + chat[1] : `#/profile/${chat.userName}`}
						className={'genchat-user ' + userClasses}
					>
						{`${chat[1]}: `}
					</a>
				</span>
				<span>{processEmotes(chat[2], isMod)}</span>
			);
		});
		// TODO: produce relevant object to be displayed
	}

	innerPart() {
		const { chatList, socket, userList, userInfo } = this.props;

		return chatList ? chatList.map((chat, idx) => {
			// TODO: make the bar blue only if its a mod chat
			const isMod =
				MODERATORS.includes(chat.userName) ||
				EDITORS.includes(chat.userName) ||
				ADMINS.includes(chat.userName);
			return (
				<div className="floatchat-window">
					<div className="floatchat-title">
						{idx}
					</div>
					<div className="floatchat-inner">
						{formatSingleChat(chat, idx)}
					</div>
					<div className="floatchat-bar">
						PUT CHAT BAR HERE
					</div>
				</div>
			);
		})
	: null;
	}

	render() {
		const { chatList, socket, userList } = this.props;

		return (
			<section className="floatchat">
				{innerPart()}
			</section>
		);
	}
}

Gamechat.propTypes = {
	chatList: PropTypes.object,
	socket: PropTypes.object,
	userList: PropTypes.object,
	userInfo: PropTypes.object
};

export default connect(mapStateToProps, mapDispatchToProps)(Gamechat);
