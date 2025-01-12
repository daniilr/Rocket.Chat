import { Box, Icon, Margins, Pagination, Skeleton, Table, Tile } from '@rocket.chat/fuselage';
import moment from 'moment';
import React, { ReactElement, useMemo, useState } from 'react';

import Growth from '../../../../../../client/components/data/Growth';
import { useTranslation } from '../../../../../../client/contexts/TranslationContext';
import Section from '../Section';
import DownloadDataButton from '../data/DownloadDataButton';
import PeriodSelector from '../data/PeriodSelector';
import { usePeriodSelectorState } from '../data/usePeriodSelectorState';
import { useChannelsList } from './useChannelsList';

const ChannelsTab = (): ReactElement => {
	const [period, periodSelectorProps] = usePeriodSelectorState(
		'last 7 days',
		'last 30 days',
		'last 90 days',
	);

	const t = useTranslation();

	const [current, setCurrent] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState<25 | 50 | 100>(25);

	const { data } = useChannelsList({
		period,
		offset: current,
		count: itemsPerPage,
	});

	const channels = useMemo(() => {
		if (!data) {
			return;
		}

		return data?.channels?.map(
			({ room: { t, name, usernames, ts, _updatedAt }, messages, diffFromLastWeek }) => ({
				t,
				name: name || usernames?.join(' × '),
				createdAt: ts,
				updatedAt: _updatedAt,
				messagesCount: messages,
				messagesVariation: diffFromLastWeek,
			}),
		);
	}, [data]);

	return (
		<Section
			filter={
				<>
					<PeriodSelector {...periodSelectorProps} />
					<DownloadDataButton
						attachmentName={`Channels_start_${data?.start}_end_${data?.end}`}
						headers={['Room type', 'Name', 'Messages', 'Last Update Date', 'Creation Date']}
						dataAvailable={!!data}
						dataExtractor={(): unknown[][] | undefined =>
							data?.channels?.map(({ room: { t, name, usernames, ts, _updatedAt }, messages }) => [
								t,
								name || usernames?.join(' × '),
								messages,
								_updatedAt,
								ts,
							])
						}
					/>
				</>
			}
		>
			<Box>
				{channels && !channels.length && (
					<Tile fontScale='p1' color='info' style={{ textAlign: 'center' }}>
						{t('No_data_found')}
					</Tile>
				)}
				{(!channels || channels.length) && (
					<Table>
						<Table.Head>
							<Table.Row>
								<Table.Cell>{'#'}</Table.Cell>
								<Table.Cell>{t('Channel')}</Table.Cell>
								<Table.Cell>{t('Created')}</Table.Cell>
								<Table.Cell>{t('Last_active')}</Table.Cell>
								<Table.Cell>{t('Messages_sent')}</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{channels?.map(
								({ t, name, createdAt, updatedAt, messagesCount, messagesVariation }, i) => (
									<Table.Row key={i}>
										<Table.Cell>{i + 1}.</Table.Cell>
										<Table.Cell>
											<Margins inlineEnd='x4'>
												{(t === 'd' && <Icon name='at' />) ||
													(t === 'c' && <Icon name='lock' />) ||
													(t === 'p' && <Icon name='hashtag' />)}
											</Margins>
											{name}
										</Table.Cell>
										<Table.Cell>{moment(createdAt).format('L')}</Table.Cell>
										<Table.Cell>{moment(updatedAt).format('L')}</Table.Cell>
										<Table.Cell>
											{messagesCount} <Growth>{messagesVariation}</Growth>
										</Table.Cell>
									</Table.Row>
								),
							)}
							{!channels &&
								Array.from({ length: 5 }, (_, i) => (
									<Table.Row key={i}>
										<Table.Cell>
											<Skeleton width='100%' />
										</Table.Cell>
										<Table.Cell>
											<Skeleton width='100%' />
										</Table.Cell>
										<Table.Cell>
											<Skeleton width='100%' />
										</Table.Cell>
										<Table.Cell>
											<Skeleton width='100%' />
										</Table.Cell>
										<Table.Cell>
											<Skeleton width='100%' />
										</Table.Cell>
									</Table.Row>
								))}
						</Table.Body>
					</Table>
				)}
				<Pagination
					current={current}
					itemsPerPage={itemsPerPage}
					itemsPerPageLabel={(): string => t('Items_per_page:')}
					showingResultsLabel={({ count, current, itemsPerPage }): string =>
						t('Showing_results_of', current + 1, Math.min(current + itemsPerPage, count), count)
					}
					count={data?.total || 0}
					onSetItemsPerPage={setItemsPerPage}
					onSetCurrent={setCurrent}
				/>
			</Box>
		</Section>
	);
};

export default ChannelsTab;
